// supabase/functions/sync-results/index.ts
// Executa a cada 10 min via pg_cron (já configurado no Supabase).
// Deploy: supabase functions deploy sync-results
// Env vars necessárias: FOOTBALL_DATA_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const API_BASE = "https://api.football-data.org/v4";

// TLA → nome em português (para casar com jogos da fase de grupos que usam nomes completos)
const TLA_PT: Record<string, string> = {
  "BRA":"Brasil","ARG":"Argentina","MEX":"México","COL":"Colômbia","URU":"Uruguai",
  "ECU":"Equador","PAR":"Paraguai","VEN":"Venezuela","CHI":"Chile","BOL":"Bolívia",
  "ESP":"Espanha","FRA":"França","ENG":"Inglaterra","GER":"Alemanha","POR":"Portugal",
  "NED":"Holanda","SUI":"Suíça","CRO":"Croácia","AUT":"Áustria","DEN":"Dinamarca",
  "TUR":"Turquia","BEL":"Bélgica","SCO":"Escócia","SRB":"Sérvia","CZE":"Rep. Tcheca",
  "HUN":"Hungria","ITA":"Itália","NOR":"Noruega","POL":"Polônia","ROU":"Romênia",
  "SVN":"Eslovênia","ALB":"Albânia","WAL":"País de Gales","IRL":"Irlanda",
  "USA":"Estados Unidos","CAN":"Canadá","JAM":"Jamaica","CRC":"Costa Rica",
  "PAN":"Panamá","HON":"Honduras","TRI":"Trinidad e Tobago","GUA":"Guatemala",
  "MAR":"Marrocos","SEN":"Senegal","EGY":"Egito","NGA":"Nigéria","GHA":"Gana",
  "CMR":"Camarões","CIV":"Costa do Marfim","TUN":"Tunísia","RSA":"África do Sul",
  "MLI":"Mali","COD":"RD Congo","MOZ":"Moçambique","GAB":"Gabão",
  "JPN":"Japão","KOR":"Coreia do Sul","SAU":"Arábia Saudita","AUS":"Austrália",
  "IRN":"Irã","IRQ":"Iraque","JOR":"Jordânia","CHN":"China","QAT":"Qatar",
  "UZB":"Uzbequistão","THA":"Tailândia","IND":"Índia",
  "NZL":"Nova Zelândia",
};

// Allowed groups for each R32 slot that requires a best-3rd-place team
// Key: num_jogo (M74, M77, etc.)
const TERCEIROS_SLOTS: Record<number, string[]> = {
  74: ["A","B","C","D","F"],
  77: ["C","D","F","G","H"],
  79: ["C","E","F","H","I"],
  80: ["E","H","I","J","K"],
  81: ["B","E","F","I","J"],
  82: ["A","E","H","I","J"],
  85: ["E","F","G","I","J"],
  87: ["D","E","I","J","L"],
};

interface Jogo {
  id: string;
  time1: string | null;
  time2: string | null;
  grupo: string | null;
  fase: string;
  data_hora: string;
  encerrado: boolean;
  resultado_g1: number | null;
  resultado_g2: number | null;
  resultado_et_g1: number | null;
  resultado_et_g2: number | null;
  resultado_pen_g1: number | null;
  resultado_pen_g2: number | null;
  vencedor: number | null;
  api_match_id: number | null;
  num_jogo: number | null;
  slot_desc1: string | null;
  slot_desc2: string | null;
  origem1: Record<string, unknown> | null;
  origem2: Record<string, unknown> | null;
}

interface Standing {
  time: string;
  grupo: string;
  pts: number;
  gf: number;
  gc: number;
  j: number;
}

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const apiKey = Deno.env.get("FOOTBALL_DATA_API_KEY") ?? "";

  const results: string[] = [];

  try {
    const r1 = await syncGroupStage(supabase, apiKey);
    results.push(`grupos: ${r1}`);
  } catch (e) { results.push(`grupos_err: ${e}`); }

  try {
    const r2 = await resolveKnockoutSlots(supabase);
    results.push(`slots: ${r2}`);
  } catch (e) { results.push(`slots_err: ${e}`); }

  try {
    const r3 = await syncKnockoutResults(supabase, apiKey);
    results.push(`knockout: ${r3}`);
  } catch (e) { results.push(`knockout_err: ${e}`); }

  return new Response(JSON.stringify({ ok: true, steps: results }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ─── STEP 1: Sync resultados da fase de grupos ────────────────────────────────
async function syncGroupStage(supabase: ReturnType<typeof createClient>, apiKey: string): Promise<string> {
  if (!apiKey) return "no_api_key";
  const data = await fetchAPI(apiKey, "/competitions/WC/matches?stage=GROUP_STAGE&status=FINISHED");
  const matches: unknown[] = (data as { matches?: unknown[] }).matches ?? [];
  let updated = 0;

  for (const raw of matches) {
    const match = raw as Record<string, unknown>;
    const score = match.score as Record<string, unknown>;
    if (!score) continue;

    const ft = score.fullTime as Record<string, number> | null;
    const rt = score.regularTime as Record<string, number> | null;
    const scoreHome = ft?.home ?? rt?.home;
    const scoreAway = ft?.away ?? rt?.away;
    if (scoreHome == null || scoreAway == null) continue;

    const matchId = match.id as number;

    // Tentar achar pelo api_match_id já salvo
    const { data: byId } = await supabase
      .from("jogos")
      .select("id")
      .eq("api_match_id", matchId)
      .single();

    let jogoId: string | null = byId?.id ?? null;

    if (!jogoId) {
      // Fallback: casar pelo nome dos times (TLA → PT) + fase de grupos
      const home = (match.homeTeam as Record<string, string> | null)?.tla ?? "";
      const away = (match.awayTeam as Record<string, string> | null)?.tla ?? "";
      const nome1 = TLA_PT[home] ?? home;
      const nome2 = TLA_PT[away] ?? away;

      const { data: byName } = await supabase
        .from("jogos")
        .select("id")
        .eq("fase", "grupos")
        .eq("time1", nome1)
        .eq("time2", nome2)
        .maybeSingle();

      jogoId = byName?.id ?? null;
    }

    if (!jogoId) continue;

    const { error } = await supabase.from("jogos").update({
      resultado_g1: scoreHome,
      resultado_g2: scoreAway,
      encerrado: true,
      api_match_id: matchId,
    }).eq("id", jogoId);

    if (!error) updated++;
  }

  return `${updated}/${matches.length}`;
}

// ─── STEP 2: Resolver slots do mata-mata ─────────────────────────────────────
async function resolveKnockoutSlots(supabase: ReturnType<typeof createClient>): Promise<string> {
  // Verificar se todos os jogos de grupos estão encerrados
  const { count: total } = await supabase
    .from("jogos").select("id", { count: "exact", head: true }).eq("fase", "grupos");
  const { count: done } = await supabase
    .from("jogos").select("id", { count: "exact", head: true }).eq("fase", "grupos").eq("encerrado", true);

  if (!total || total !== done) return `grupos_pendentes: ${done}/${total}`;

  // Carregar todos os jogos de grupos encerrados
  const { data: jogosGrupo } = await supabase
    .from("jogos")
    .select("time1,time2,grupo,resultado_g1,resultado_g2")
    .eq("fase", "grupos")
    .eq("encerrado", true);

  if (!jogosGrupo?.length) return "sem_jogos_grupo";

  const standings = calcGroupStandings(jogosGrupo as { time1: string; time2: string; grupo: string; resultado_g1: number; resultado_g2: number }[]);

  // Selecionar os 8 melhores 3ºs colocados
  const terceirosAll: Standing[] = Object.values(standings).map((g: Standing[]) => g[2]).filter(Boolean);
  const terceiros8 = terceirosAll.sort(compareStandings).slice(0, 8);

  // Bipartite matching: atribuir cada 3º ao slot correto
  const slots = Object.entries(TERCEIROS_SLOTS).map(([num, grupos]) => ({
    num: parseInt(num), grupos,
  }));
  const slotAssign = assignTerceiros(slots, terceiros8); // num_jogo → time_name

  let resolved = 0;

  // Resolver Rodada de 32
  const { data: slots16 } = await supabase
    .from("jogos").select("*").eq("fase", "16avos");

  for (const slot of (slots16 as Jogo[]) ?? []) {
    const time1 = slot.time1 ?? resolveOrigem(slot.origem1, standings, slotAssign);
    const time2 = slot.time2 ?? resolveOrigem(slot.origem2, standings, slotAssign);
    const upd: Record<string, string | null> = {};
    if (!slot.time1 && time1) upd.time1 = time1;
    if (!slot.time2 && time2) upd.time2 = time2;
    if (Object.keys(upd).length) {
      await supabase.from("jogos").update(upd).eq("id", slot.id);
      resolved++;
    }
  }

  // Resolver fases seguintes (baseadas em vencedores de jogos anteriores)
  for (const fase of ["oitavas", "quartas", "semis", "terceiro", "final"]) {
    const { data: faseSlots } = await supabase
      .from("jogos").select("*").eq("fase", fase);

    for (const slot of (faseSlots as Jogo[]) ?? []) {
      const time1 = slot.time1 ?? await resolveVencedorOrigem(slot.origem1, supabase);
      const time2 = slot.time2 ?? await resolveVencedorOrigem(slot.origem2, supabase);
      const upd: Record<string, string | null> = {};
      if (!slot.time1 && time1) upd.time1 = time1;
      if (!slot.time2 && time2) upd.time2 = time2;
      if (Object.keys(upd).length) {
        await supabase.from("jogos").update(upd).eq("id", slot.id);
        resolved++;
      }
    }
  }

  return `resolved: ${resolved}`;
}

function calcGroupStandings(
  jogos: { time1: string; time2: string; grupo: string; resultado_g1: number; resultado_g2: number }[]
): Record<string, Standing[]> {
  const groups: Record<string, Record<string, Standing>> = {};

  for (const j of jogos) {
    if (!groups[j.grupo]) groups[j.grupo] = {};
    for (const time of [j.time1, j.time2]) {
      if (!groups[j.grupo][time]) {
        groups[j.grupo][time] = { time, grupo: j.grupo, pts: 0, gf: 0, gc: 0, j: 0 };
      }
    }
    const g1 = j.resultado_g1, g2 = j.resultado_g2;
    groups[j.grupo][j.time1].j++;
    groups[j.grupo][j.time2].j++;
    groups[j.grupo][j.time1].gf += g1;
    groups[j.grupo][j.time1].gc += g2;
    groups[j.grupo][j.time2].gf += g2;
    groups[j.grupo][j.time2].gc += g1;
    if (g1 > g2) { groups[j.grupo][j.time1].pts += 3; }
    else if (g1 < g2) { groups[j.grupo][j.time2].pts += 3; }
    else { groups[j.grupo][j.time1].pts += 1; groups[j.grupo][j.time2].pts += 1; }
  }

  const result: Record<string, Standing[]> = {};
  for (const [grupo, teams] of Object.entries(groups)) {
    result[grupo] = Object.values(teams).sort(compareStandings);
  }
  return result;
}

function compareStandings(a: Standing, b: Standing): number {
  if (b.pts !== a.pts) return b.pts - a.pts;
  const asd = a.gf - a.gc, bsd = b.gf - b.gc;
  if (bsd !== asd) return bsd - asd;
  return b.gf - a.gf;
}

function assignTerceiros(
  slots: { num: number; grupos: string[] }[],
  terceiros: Standing[]
): Record<number, string> {
  const assignment: Record<number, string> = {};

  // Ordenar slots pelos que têm menos candidatos disponíveis (mais restritos primeiro)
  const sorted = [...slots].sort((a, b) => {
    const aOpts = terceiros.filter(t => a.grupos.includes(t.grupo)).length;
    const bOpts = terceiros.filter(t => b.grupos.includes(t.grupo)).length;
    return aOpts - bOpts;
  });

  function backtrack(idx: number, used: Set<string>): boolean {
    if (idx === sorted.length) return true;
    const slot = sorted[idx];
    const candidates = terceiros.filter(t => slot.grupos.includes(t.grupo) && !used.has(t.time));
    for (const team of candidates) {
      assignment[slot.num] = team.time;
      used.add(team.time);
      if (backtrack(idx + 1, used)) return true;
      delete assignment[slot.num];
      used.delete(team.time);
    }
    return false;
  }

  backtrack(0, new Set());
  return assignment;
}

function resolveOrigem(
  origem: Record<string, unknown> | null,
  standings: Record<string, Standing[]>,
  slotAssign: Record<number, string>
): string | null {
  if (!origem) return null;
  const tipo = origem.tipo as string;
  const grupo = origem.grupo as string | undefined;
  const grupos = origem.grupos as string[] | undefined;

  if (tipo === "1grupo" && grupo && standings[grupo]?.[0]) return standings[grupo][0].time;
  if (tipo === "2grupo" && grupo && standings[grupo]?.[1]) return standings[grupo][1].time;
  if (tipo === "3grupo" && grupos) {
    // Achar o slot (num_jogo) que tem exatamente esses grupos permitidos
    const slotNum = Object.entries(TERCEIROS_SLOTS).find(([, g]) =>
      g.length === grupos.length && g.every(x => grupos.includes(x))
    )?.[0];
    if (slotNum) return slotAssign[parseInt(slotNum)] ?? null;
  }
  return null;
}

async function resolveVencedorOrigem(
  origem: Record<string, unknown> | null,
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  if (!origem) return null;
  const tipo = origem.tipo as string;
  const num = origem.num as number | undefined;
  if (!num) return null;

  const { data: jogo } = await supabase
    .from("jogos")
    .select("time1,time2,vencedor,resultado_g1,resultado_g2,resultado_et_g1,resultado_et_g2,encerrado")
    .eq("num_jogo", num)
    .single();

  if (!jogo?.encerrado) return null;

  const j = jogo as Jogo;
  if (tipo === "vencedor") {
    if (j.vencedor === 1) return j.time1;
    if (j.vencedor === 2) return j.time2;
    // Fallback via resultado
    if ((j.resultado_g1 ?? 0) > (j.resultado_g2 ?? 0)) return j.time1;
    if ((j.resultado_g2 ?? 0) > (j.resultado_g1 ?? 0)) return j.time2;
  }
  if (tipo === "perdedor") {
    if (j.vencedor === 1) return j.time2;
    if (j.vencedor === 2) return j.time1;
  }
  return null;
}

// ─── STEP 3: Sync resultados do mata-mata ────────────────────────────────────
async function syncKnockoutResults(supabase: ReturnType<typeof createClient>, apiKey: string): Promise<string> {
  if (!apiKey) return "no_api_key";

  const STAGE_MAP: Record<string, string> = {
    "16avos":   "LAST_32",
    "oitavas":  "LAST_16",
    "quartas":  "QUARTER_FINALS",
    "semis":    "SEMI_FINALS",
    "terceiro": "THIRD_PLACE",
    "final":    "FINAL",
  };

  let updated = 0;

  for (const [fase, apiStage] of Object.entries(STAGE_MAP)) {
    try {
      const data = await fetchAPI(apiKey, `/competitions/WC/matches?stage=${apiStage}&status=FINISHED`);
      const matches = (data as { matches?: unknown[] }).matches ?? [];

      for (const raw of matches) {
        const match = raw as Record<string, unknown>;
        const score = match.score as Record<string, unknown>;
        if (!score) continue;

        const home = (match.homeTeam as Record<string, string>)?.tla ?? "";
        const away = (match.awayTeam as Record<string, string>)?.tla ?? "";

        const { data: jogo } = await supabase
          .from("jogos")
          .select("id")
          .eq("fase", fase)
          .eq("time1", home)
          .eq("time2", away)
          .maybeSingle();

        if (!jogo) continue;

        const duration = score.duration as string;
        const ft = score.fullTime as Record<string, number> | null;
        const rt = score.regularTime as Record<string, number> | null;
        const et = score.extraTime as Record<string, number> | null;
        const pen = score.penalties as Record<string, number> | null;

        // Resultado de 90 min (base da pontuação dos palpites)
        const g1 = rt?.home ?? ft?.home ?? null;
        const g2 = rt?.away ?? ft?.away ?? null;
        if (g1 == null) continue;

        const updates: Record<string, unknown> = {
          resultado_g1: g1,
          resultado_g2: g2,
          encerrado: true,
          api_match_id: match.id,
        };

        if (duration === "EXTRA_TIME" || duration === "PENALTY_SHOOTOUT") {
          if (et?.home != null) { updates.resultado_et_g1 = et.home; updates.resultado_et_g2 = et.away; }
        }
        if (duration === "PENALTY_SHOOTOUT") {
          if (pen?.home != null) { updates.resultado_pen_g1 = pen.home; updates.resultado_pen_g2 = pen.away; }
        }

        const winner = score.winner as string;
        if (winner === "HOME_TEAM") updates.vencedor = 1;
        else if (winner === "AWAY_TEAM") updates.vencedor = 2;

        const { error } = await supabase.from("jogos").update(updates).eq("id", jogo.id);
        if (!error) updated++;
      }
    } catch (e) {
      console.error(`Erro ao sincronizar ${fase}:`, e);
    }
  }

  return `updated: ${updated}`;
}

// ─── Utilitário HTTP ──────────────────────────────────────────────────────────
async function fetchAPI(apiKey: string, path: string): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Auth-Token": apiKey },
  });
  if (!res.ok) throw new Error(`football-data.org ${res.status}: ${path}`);
  return res.json();
}
