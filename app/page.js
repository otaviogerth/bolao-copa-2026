"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const RED = "#D8091B";
const YELLOW = "#FFD101";
const BLUE = "#0045B5";
const DARK = "#080808";
const SUPA = "https://gdkvezigujpaqqavablu.supabase.co/storage/v1/object/public/assets";

const CODIGOS = {
  "México": "mx", "África do Sul": "za", "Coreia do Sul": "kr", "Rep. Tcheca": "cz",
  "Canadá": "ca", "Bósnia": "ba", "Qatar": "qa", "Suíça": "ch",
  "Brasil": "br", "Marrocos": "ma", "Haiti": "ht", "Escócia": "gb-sct",
  "Estados Unidos": "us", "Paraguai": "py", "Austrália": "au", "Turquia": "tr",
  "Alemanha": "de", "Curaçao": "cw", "Costa do Marfim": "ci", "Equador": "ec",
  "Holanda": "nl", "Japão": "jp", "Suécia": "se", "Tunísia": "tn",
  "Espanha": "es", "Cabo Verde": "cv", "Arábia Saudita": "sa", "Uruguai": "uy",
  "Bélgica": "be", "Egito": "eg", "Irã": "ir", "Nova Zelândia": "nz",
  "França": "fr", "Senegal": "sn", "Iraque": "iq", "Noruega": "no",
  "Argentina": "ar", "Argélia": "dz", "Áustria": "at", "Jordânia": "jo",
  "Portugal": "pt", "RD Congo": "cd", "Uzbequistão": "uz", "Colômbia": "co",
  "Inglaterra": "gb-eng", "Croácia": "hr", "Gana": "gh", "Panamá": "pa",
};

function Flag({ time, size = 32 }) {
  const cod = CODIGOS[time];
  if (!cod) return <span style={{ fontSize: size * 0.8 }}>🏳</span>;
  const upper = cod.includes("-") ? cod.split("-")[0].toUpperCase() : cod.toUpperCase();
  return <img src={`https://flagsapi.com/${upper}/flat/64.png`} width={size} height={size} style={{ borderRadius: 3, objectFit: "cover" }} alt={time} />;
}

function calcPontos(g1, g2, rg1, rg2) {
  if (rg1 == null || rg2 == null) return null;
  if (g1 === rg1 && g2 === rg2) return 3;
  const v = (a, b) => a > b ? 1 : b > a ? 2 : 0;
  if (v(g1, g2) === v(rg1, rg2)) return 1;
  return 0;
}

function formatDoc(doc) {
  const d = doc.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}

function formatData(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) + " · " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const s = {
  btn: { cursor: "pointer", border: "1px solid #444", borderRadius: 8, padding: "6px 14px", fontSize: 13, background: "transparent", color: "#fff" },
  btnP: { cursor: "pointer", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, background: RED, color: "#fff", fontWeight: 500 },
  card: { background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12, marginLeft: "1rem", marginRight: "1rem" },
  inp: { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 },
  num: { width: 52, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid #ddd", fontSize: 18, fontWeight: 500 },
  nav: { display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap", padding: "0 1rem" },
  navB: (a) => ({ cursor: "pointer", padding: "6px 14px", borderRadius: 8, border: "1px solid " + (a ? RED : "#ddd"), fontSize: 13, background: a ? RED : "transparent", color: a ? "#fff" : "#333", fontWeight: a ? 500 : 400 }),
  tag: (p) => ({ fontSize: 11, borderRadius: 6, padding: "2px 8px", background: p === 3 ? "#fde8ec" : p === 1 ? "#fff8cc" : "#f5f5f5", color: p === 3 ? RED : p === 1 ? "#7a5800" : "#888" }),
};

function Banner() {
  return (
    <div style={{ width: "100%", background: DARK, display: "flex", alignItems: "stretch", justifyContent: "space-between", minHeight: 110 }}>
      {/* Listras esquerda */}
      <img
        src={SUPA + "/listras%20esquerda.png"}
        alt=""
        style={{ height: 140, width: 80, objectFit: "contain", objectPosition: "left", display: "block", flexShrink: 0 }}
      />
      {/* Logo central */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={SUPA + "/Logo%20branca%20sem%20fundo.png"}
          alt="Bet Lube Copa 2026"
          style={{ height: 100, width: "auto", objectFit: "contain" }}
        />
      </div>
      {/* Listras direita */}
      <img
        src={SUPA + "/listras%20direita.png"}
        alt=""
        style={{ height: 140, width: 80, objectFit: "cover", objectPosition: "top", display: "block", flexShrink: 0 }}
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tela, setTela] = useState("login");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [jogos, setJogos] = useState([]);
  const [palpites, setPalpites] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [msg, setMsg] = useState("");

  const isAdmin = user && user.doc === "admin";

  async function login(doc, senha) {
    setLoading(true); setLoginErr("");
    const docLimpo = doc.replace(/\D/g, "") || doc;
    const { data, error } = await supabase.from("clientes").select("*").eq("doc", docLimpo).eq("senha", senha).eq("ativo", true).limit(1);
    if (error || !data.length) { setLoginErr("CPF/CNPJ ou senha incorretos."); setLoading(false); return; }
    const u = data[0];
    setUser(u);
    await carregarJogos();
    if (u.doc === "admin") { await carregarClientes(); setTela("admin"); }
    else { await carregarPalpites(u.id); setTela("boasvindas"); }
    setLoading(false);
  }

  async function carregarJogos() {
    const { data } = await supabase.from("jogos").select("*").order("data_hora");
    setJogos(data || []);
  }
  async function carregarPalpites(clienteId) {
    const { data } = await supabase.from("palpites").select("*").eq("cliente_id", clienteId);
    setPalpites(data || []);
  }
  async function carregarClientes() {
    const { data } = await supabase.from("clientes").select("*").order("nome");
    setClientes(data || []);
  }
  async function carregarTodosPalpites() {
    const { data } = await supabase.from("palpites").select("*");
    setPalpites(data || []);
  }

  function logout() { setUser(null); setTela("login"); setJogos([]); setPalpites([]); setClientes([]); }
  function flash(text, err) { setMsg({ text, err }); setTimeout(() => setMsg(""), 2500); }

  async function salvarPalpite(jogoId, g1, g2) {
    const exist = palpites.find(p => p.jogo_id === jogoId);
    if (exist) {
      await supabase.from("palpites").update({ g1: parseInt(g1), g2: parseInt(g2) }).eq("id", exist.id);
    } else {
      await supabase.from("palpites").insert({ cliente_id: user.id, jogo_id: jogoId, g1: parseInt(g1), g2: parseInt(g2) });
    }
    await carregarPalpites(user.id);
    flash("Palpite salvo!");
  }

  async function salvarResultado(jogoId, g1, g2) {
    await supabase.from("jogos").update({ resultado_g1: parseInt(g1), resultado_g2: parseInt(g2), encerrado: true }).eq("id", jogoId);
    await carregarJogos();
    flash("Resultado salvo!");
  }

  async function addCliente(doc, nome, senha) {
    const { error } = await supabase.from("clientes").insert({ doc: doc.replace(/\D/g, ""), nome, senha, ativo: true });
    if (error) { flash("Erro: CPF/CNPJ já cadastrado.", true); return; }
    await carregarClientes();
    flash("Cliente adicionado!");
  }

  async function toggleCliente(id, ativo) {
    await supabase.from("clientes").update({ ativo: !ativo }).eq("id", id);
    await carregarClientes();
  }

  const ranking = clientes.filter(c => c.doc !== "admin").map(c => {
    let pts = 0, acertos = 0;
    jogos.forEach(j => {
      const p = palpites.find(x => x.cliente_id === c.id && x.jogo_id === j.id);
      if (!p || j.resultado_g1 == null) return;
      const pp = calcPontos(p.g1, p.g2, j.resultado_g1, j.resultado_g2);
      pts += pp; if (pp === 3) acertos++;
    });
    return { ...c, pts, acertos };
  }).sort((a, b) => b.pts - a.pts || b.acertos - a.acertos);

  const meuRank = user ? ranking.findIndex(r => r.id === user.id) + 1 : 0;
  const meusPts = user ? (ranking.find(r => r.id === user.id) || {}).pts || 0 : 0;

  const wrap = { fontFamily: "Arial, sans-serif", minHeight: "100vh" };
  const inner = { background: "#fff", width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" };

  // LOGIN
  if (tela === "login") {
    return (
      <div style={wrap}>
        <div style={inner}>
          <Banner />
          <div style={{ flex: 1, padding: "2rem 2rem 1rem" }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#999", letterSpacing: 2, marginBottom: "2rem", fontFamily: "Arial Black, sans-serif" }}>LOGIN</div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: 15, color: "#aaa", marginBottom: 8 }}>CNPJ ou CPF</div>
              <input id="doc" style={{ width: "100%", border: "none", borderBottom: "1.5px solid #333", outline: "none", fontSize: 16, padding: "8px 0", background: "transparent", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ fontSize: 15, color: "#aaa", marginBottom: 8 }}>Senha</div>
              <input id="senha" type="password" style={{ width: "100%", border: "none", borderBottom: "1.5px solid #333", outline: "none", fontSize: 16, padding: "8px 0", background: "transparent", boxSizing: "border-box" }}
                onKeyDown={e => e.key === "Enter" && login(document.getElementById("doc").value, document.getElementById("senha").value)} />
            </div>
            {loginErr && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>{loginErr}</p>}
            <button style={{ width: "100%", background: DARK, color: "#fff", border: "none", padding: "14px", fontSize: 16, fontWeight: 700, letterSpacing: 2, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
              onClick={() => login(document.getElementById("doc").value, document.getElementById("senha").value)} disabled={loading}>
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </button>
          </div>
          <div style={{ padding: "1.5rem 2rem", textAlign: "center" }}>
            <div style={{ marginBottom: "1rem" }}>
              <img src={SUPA + "/bel%20lube%20logo.png"} alt="Bel Lube" style={{ maxHeight: 50, objectFit: "contain" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
              <img src={SUPA + "/ipiranga%20logo.png"} alt="Ipiranga" style={{ maxHeight: 24, maxWidth: "50%", objectFit: "contain" }} />
              <img src={SUPA + "/texaco%20logo.png"} alt="Texaco" style={{ maxHeight: 24, maxWidth: "50%", objectFit: "contain" }} />
            </div>
            <div style={{ fontSize: 12, color: "#bbb" }}>Criado e desenvolvido por Gerth Consultoria</div>
          </div>
        </div>
      </div>
    );
  }

  // BOAS-VINDAS
  if (tela === "boasvindas") {
    return (
      <div style={wrap}>
        <div style={{ ...inner, background: DARK }}>
          <Banner />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem 1rem" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚽</div>
          <div style={{ color: YELLOW, fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Bem-vindo ao Bolão da Copa 2026</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Olá, {user.nome.split(" ")[0]}!</div>
          <div style={{ color: "#aaa", fontSize: 14, maxWidth: 300, lineHeight: 1.6, marginBottom: 32 }}>
            Faça seus palpites antes de cada jogo e acumule pontos.
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: YELLOW, fontSize: 22, fontWeight: 700 }}>3pts</div>
              <div style={{ color: "#666", fontSize: 12 }}>Placar exato</div>
            </div>
            <div style={{ width: 1, background: "#333" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>1pt</div>
              <div style={{ color: "#666", fontSize: 12 }}>Vencedor</div>
            </div>
          </div>
          <button style={{ ...s.btnP, fontSize: 16, padding: "12px 36px", borderRadius: 12 }} onClick={() => setTela("jogos")}>
            Ver os jogos →
          </button>
          </div>
        </div>
      </div>
    );
  }

  // APP PRINCIPAL
  return (
    <div style={wrap}>
      <div style={inner}>
        <Banner />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderBottom: "3px solid " + RED, background: DARK }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: RED, fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>⚽ BOLÃO COPA 2026</div>
            <div style={{ width: 1, height: 16, background: "#444" }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{isAdmin ? "Admin" : user.nome}</div>
              {!isAdmin && <div style={{ fontSize: 10, color: "#aaa" }}>{formatDoc(user.doc)}</div>}
            </div>
          </div>
          <button style={s.btn} onClick={logout}>Sair</button>
        </div>

        {msg && (
          <div style={{ margin: "0 1rem 1rem", padding: "8px 14px", borderRadius: 8, background: msg.err ? "#fde8ec" : "#f0fff4", color: msg.err ? RED : "#2d7a4f", fontSize: 13 }}>
            {msg.text}
          </div>
        )}

        {!isAdmin && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "1rem 1rem 0" }}>
            {[["Seus pontos", meusPts], ["Posição", meuRank > 0 ? meuRank + "º" : "—"]].map(([l, v]) => (
              <div key={l} style={{ background: "#fff", borderRadius: 8, padding: "0.75rem 1rem", borderLeft: "4px solid " + RED, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
                <div style={{ fontSize: 24, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...s.nav, marginTop: "1rem" }}>
          {isAdmin
            ? [["admin","Início"],["clientes","Clientes"],["resultados","Resultados"],["ranking","Ranking"]].map(([t, l]) => (
                <button key={t} style={s.navB(tela === t)} onClick={async () => {
                  setTela(t);
                  if (t === "clientes") await carregarClientes();
                  if (t === "resultados") await carregarJogos();
                  if (t === "ranking") { await carregarJogos(); await carregarClientes(); await carregarTodosPalpites(); }
                }}>{l}</button>
              ))
            : [["jogos","Palpites"],["ranking","Ranking"]].map(([t, l]) => (
                <button key={t} style={s.navB(tela === t)} onClick={async () => {
                  setTela(t);
                  if (t === "ranking") { await carregarClientes(); await carregarTodosPalpites(); }
                }}>{l}</button>
              ))
          }
        </div>

        {tela === "admin" && (
          <div style={s.card}>
            <p style={{ margin: 0, fontSize: 14, color: "#555" }}>Use o menu acima para gerenciar clientes, inserir resultados e acompanhar o ranking.</p>
          </div>
        )}

        {tela === "clientes" && <AdminClientes clientes={clientes} onAdd={addCliente} onToggle={toggleCliente} />}

        {tela === "resultados" && jogos.map(j => (
          <div key={j.id} style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>Grupo {j.grupo}</span>
              <span style={{ fontSize: 11, color: "#aaa" }}>{formatData(j.data_hora)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 500, flex: 1, display: "flex", alignItems: "center", gap: 6 }}><Flag time={j.time1} size={20} /> {j.time1}</span>
              <ResultInput jogo={j} onSalvar={salvarResultado} />
              <span style={{ fontWeight: 500, flex: 1, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>{j.time2} <Flag time={j.time2} size={20} /></span>
            </div>
          </div>
        ))}

        {tela === "ranking" && <RankingView ranking={ranking} myId={user.id} />}
        {tela === "jogos" && <ListaJogos jogos={jogos} palpites={palpites} onSalvar={salvarPalpite} />}
      </div>
    </div>
  );
}

function RankingView({ ranking, myId }) {
  const podio = ranking.slice(0, 3);
  const resto = ranking.slice(3);
  const cfg = [
    { cor: "#FFD101", altura: 110, emoji: "🥇", pos: "1º" },
    { cor: "#C0C0C0", altura: 80, emoji: "🥈", pos: "2º" },
    { cor: "#CD7F32", altura: 70, emoji: "🥉", pos: "3º" },
  ];
  const ordem = [1, 0, 2];
  return (
    <div>
      {ranking.length === 0 && <p style={{ fontSize: 14, color: "#888", padding: "0 1rem" }}>Nenhum palpite ainda.</p>}
      {podio.length >= 1 && (
        <div style={{ background: DARK, borderRadius: 16, margin: "0 1rem 1rem", padding: "1.5rem 1rem 0", overflow: "hidden" }}>
          <div style={{ textAlign: "center", color: YELLOW, fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: "1.25rem" }}>PÓDIO</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>
            {ordem.map(idx => {
              const c = podio[idx];
              if (!c) return <div key={idx} style={{ flex: 1 }} />;
              const conf = cfg[idx];
              return (
                <div key={c.id} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{c.nome.split(" ")[0]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: conf.cor, marginBottom: 2 }}>{c.pts}pts</div>
                  <div style={{ background: conf.cor, borderRadius: "8px 8px 0 0", height: conf.altura, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 24 }}>{conf.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: DARK, marginTop: 4 }}>{conf.pos}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {resto.length > 0 && (
        <div style={{ margin: "0 1rem 1rem" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 2, padding: "0.75rem 0 0.5rem" }}>CLASSIFICAÇÃO GERAL</div>
          {resto.map((c, i) => (
            <div key={c.id} style={{ background: "#fff", border: "1px solid " + (c.id === myId ? RED : "#e5e5e5"), borderWidth: c.id === myId ? 2 : 1, borderRadius: 10, padding: "0.75rem 1rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#aaa", minWidth: 28 }}>{i + 4}º</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{c.nome}</div>
                <div style={{ fontSize: 12, color: "#aaa" }}>{c.acertos} placar(es) exato(s)</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{c.pts}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>pts</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ListaJogos({ jogos, palpites, onSalvar }) {
  const [rodada, setRodada] = useState("todas");
  const RODADAS = [
    { id: "todas", label: "Todos" },
    { id: "1", label: "1ª Rodada", inicio: "2026-06-11", fim: "2026-06-17" },
    { id: "2", label: "2ª Rodada", inicio: "2026-06-18", fim: "2026-06-23" },
    { id: "3", label: "3ª Rodada", inicio: "2026-06-24", fim: "2026-06-28" },
  ];
  const filtrados = jogos.filter(j => {
    if (rodada === "todas") return true;
    const r = RODADAS.find(x => x.id === rodada);
    const d = j.data_hora.slice(0, 10);
    return d >= r.inicio && d <= r.fim;
  });
  const grupos = {};
  filtrados.forEach(j => {
    const dia = j.data_hora.slice(0, 10);
    if (!grupos[dia]) grupos[dia] = [];
    grupos[dia].push(j);
  });
  function formatDia(iso) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  }
  function formatHora(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return (
    <div>
      <div style={{ display: "flex", gap: 8, padding: "0 1rem 1.25rem", flexWrap: "wrap" }}>
        {RODADAS.map(r => (
          <button key={r.id} onClick={() => setRodada(r.id)} style={{ cursor: "pointer", padding: "5px 14px", borderRadius: 20, border: "1px solid " + (rodada === r.id ? RED : "#ddd"), background: rodada === r.id ? RED : "#fff", color: rodada === r.id ? "#fff" : "#555", fontSize: 13, fontWeight: rodada === r.id ? 600 : 400 }}>{r.label}</button>
        ))}
      </div>
      {Object.keys(grupos).sort().map(dia => (
        <div key={dia}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.5rem 1rem 0.75rem" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#555", textTransform: "capitalize", whiteSpace: "nowrap" }}>{formatDia(dia)}</span>
            <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
          </div>
          {grupos[dia].map(j => {
            const p = palpites.find(x => x.jogo_id === j.id);
            const passou = new Date(j.data_hora) < new Date();
            const pts = p && j.resultado_g1 != null ? calcPontos(p.g1, p.g2, j.resultado_g1, j.resultado_g2) : null;
            const isBrasil = j.time1 === "Brasil" || j.time2 === "Brasil";
            return (
              <div key={j.id} style={{ background: "#fff", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12, marginLeft: "1rem", marginRight: "1rem", borderLeft: isBrasil ? "4px solid " + YELLOW : "1px solid #e5e5e5", borderTop: "1px solid #e5e5e5", borderRight: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: DARK, borderRadius: 4, padding: "2px 7px", letterSpacing: 1 }}>GRP {j.grupo}</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>{formatHora(j.data_hora)}</span>
                  </div>
                  {pts !== null && <span style={{ fontSize: 11, borderRadius: 6, padding: "2px 8px", background: pts === 3 ? "#fde8ec" : pts === 1 ? "#fff8cc" : "#f5f5f5", color: pts === 3 ? RED : pts === 1 ? "#7a5800" : "#888" }}>{pts === 3 ? "⭐ +3" : pts === 1 ? "✓ +1" : "✗ Errou"}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <Flag time={j.time1} size={48} />
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 6 }}>{j.time1}</div>
                  </div>
                  <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                    {passou || j.encerrado ? (
                      <div>
                        {j.encerrado ? <div style={{ fontSize: 24, fontWeight: 700, color: DARK, letterSpacing: 2 }}>{j.resultado_g1} — {j.resultado_g2}</div> : <div style={{ fontSize: 13, color: "#aaa" }}>Em andamento</div>}
                        {p ? <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Palpite: {p.g1}x{p.g2}</div> : <div style={{ fontSize: 12, color: "#ccc", marginTop: 4 }}>Sem palpite</div>}
                      </div>
                    ) : (
                      <PalpiteInput jogoId={j.id} palpiteAtual={p} onSalvar={onSalvar} />
                    )}
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}><Flag time={j.time2} size={48} /></div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 6 }}>{j.time2}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function AdminClientes({ clientes, onAdd, onToggle }) {
  const [doc, setDoc] = useState(""); const [nome, setNome] = useState(""); const [senha, setSenha] = useState("");
  return (
    <div>
      <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12, marginLeft: "1rem", marginRight: "1rem" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Novo cliente</div>
        <div style={{ display: "grid", gap: 8 }}>
          <input style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} placeholder="CPF ou CNPJ (só números)" value={doc} onChange={e => setDoc(e.target.value)} />
          <input style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} placeholder="Nome / Razão social" value={nome} onChange={e => setNome(e.target.value)} />
          <input style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} placeholder="Senha inicial" value={senha} onChange={e => setSenha(e.target.value)} />
          <button style={{ cursor: "pointer", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, background: RED, color: "#fff", fontWeight: 500 }} onClick={async () => { await onAdd(doc, nome, senha); setDoc(""); setNome(""); setSenha(""); }}>Adicionar</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8, padding: "0 1rem" }}>{clientes.filter(c => c.doc !== "admin" && c.ativo).length} clientes ativos</div>
      {clientes.filter(c => c.doc !== "admin").map(c => (
        <div key={c.id} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12, marginLeft: "1rem", marginRight: "1rem", display: "flex", alignItems: "center", gap: 12, opacity: c.ativo ? 1 : 0.5 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{c.nome}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{c.doc}</div>
          </div>
          <button style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", fontSize: 12, background: "transparent" }} onClick={() => onToggle(c.id, c.ativo)}>{c.ativo ? "Desativar" : "Ativar"}</button>
        </div>
      ))}
    </div>
  );
}

function ResultInput({ jogo, onSalvar }) {
  const [g1, setG1] = useState(jogo.resultado_g1 != null ? jogo.resultado_g1 : "");
  const [g2, setG2] = useState(jogo.resultado_g2 != null ? jogo.resultado_g2 : "");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input style={{ width: 52, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid #ddd", fontSize: 18, fontWeight: 500 }} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#888" }}>x</span>
        <input style={{ width: 52, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid #ddd", fontSize: 18, fontWeight: 500 }} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button style={{ cursor: "pointer", border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 12, background: RED, color: "#fff", fontWeight: 500 }} onClick={() => onSalvar(jogo.id, g1, g2)}>
        {jogo.encerrado ? "Atualizar" : "Confirmar"}
      </button>
      {jogo.encerrado && <span style={{ fontSize: 11, color: "#2d7a4f" }}>✓ {jogo.resultado_g1}x{jogo.resultado_g2}</span>}
    </div>
  );
}

function PalpiteInput({ jogoId, palpiteAtual, onSalvar }) {
  const [g1, setG1] = useState(palpiteAtual ? palpiteAtual.g1 : "");
  const [g2, setG2] = useState(palpiteAtual ? palpiteAtual.g2 : "");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input style={{ width: 52, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid #ddd", fontSize: 18, fontWeight: 500 }} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#888" }}>x</span>
        <input style={{ width: 52, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid #ddd", fontSize: 18, fontWeight: 500 }} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button style={{ cursor: "pointer", border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 12, background: palpiteAtual ? "#a00614" : RED, color: "#fff", fontWeight: 500 }}
        onClick={() => onSalvar(jogoId, g1, g2)} disabled={g1 === "" || g2 === ""}>
        {palpiteAtual ? "Atualizar" : "Salvar palpite"}
      </button>
    </div>
  );
}
