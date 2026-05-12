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
const CARD = "#111111";
const BORDER = "#222222";
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
  if (!cod) return <span style={{ fontSize: size * 0.8, color: "#fff" }}>🏳</span>;
  const upper = cod.includes("-") ? cod.split("-")[0].toUpperCase() : cod.toUpperCase();
  return <img src={`https://flagsapi.com/${upper}/flat/64.png`} width={size} height={size} style={{ borderRadius: 4, objectFit: "cover", display: "block" }} alt={time} />;
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

function Banner() {
  return (
    <div style={{ width: "100%", background: DARK, display: "flex", alignItems: "stretch", justifyContent: "space-between", minHeight: 110 }}>
      <img src={SUPA + "/listras%20esquerda.png"} alt="" style={{ height: 140, width: 80, objectFit: "contain", objectPosition: "left", display: "block", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={SUPA + "/Logo%20branca%20sem%20fundo.png"} alt="Bet Lube Copa 2026" style={{ height: 100, width: "auto", objectFit: "contain" }} />
      </div>
      <img src={SUPA + "/listras%20direita.png"} alt="" style={{ height: 140, width: 80, objectFit: "cover", objectPosition: "top", display: "block", flexShrink: 0 }} />
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

  // LOGIN
  if (tela === "login") {
    return (
      <div style={{ fontFamily: "Inter, Arial, sans-serif", background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ width: "100%", background: DARK, display: "flex", alignItems: "stretch", justifyContent: "space-between", minHeight: 110 }}>
          <img src={SUPA + "/listras%20esquerda.png"} alt="" style={{ height: 140, width: 80, objectFit: "contain", objectPosition: "left", display: "block", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={SUPA + "/Logo%20branca%20sem%20fundo.png"} alt="Bet Lube" style={{ height: 100, width: "auto", objectFit: "contain" }} />
          </div>
          <img src={SUPA + "/listras%20direita.png"} alt="" style={{ height: 140, width: 80, objectFit: "cover", objectPosition: "top", display: "block", flexShrink: 0 }} />
        </div>
        <div style={{ flex: 1, padding: "2rem 2rem 1rem" }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: "#ccc", letterSpacing: 2, marginBottom: "2rem", fontFamily: "Arial Black, sans-serif" }}>LOGIN</div>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: 14, color: "#aaa", marginBottom: 8 }}>CNPJ ou CPF</div>
            <input id="doc" style={{ width: "100%", border: "none", borderBottom: "1.5px solid #333", outline: "none", fontSize: 16, padding: "8px 0", background: "transparent", boxSizing: "border-box", color: DARK }} />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: 14, color: "#aaa", marginBottom: 8 }}>Senha</div>
            <input id="senha" type="password" style={{ width: "100%", border: "none", borderBottom: "1.5px solid #333", outline: "none", fontSize: 16, padding: "8px 0", background: "transparent", boxSizing: "border-box", color: DARK }}
              onKeyDown={e => e.key === "Enter" && login(document.getElementById("doc").value, document.getElementById("senha").value)} />
          </div>
          {loginErr && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>{loginErr}</p>}
          <button style={{ width: "100%", background: DARK, color: "#fff", border: "none", padding: "14px", fontSize: 15, fontWeight: 700, letterSpacing: 2, cursor: "pointer", opacity: loading ? 0.7 : 1, borderRadius: 4 }}
            onClick={() => login(document.getElementById("doc").value, document.getElementById("senha").value)} disabled={loading}>
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </div>
        <div style={{ padding: "1rem 2rem 1.5rem", textAlign: "center" }}>
          <div style={{ marginBottom: "1rem" }}>
            <img src={SUPA + "/bel%20lube%20logo.png"} alt="Bel Lube" style={{ maxHeight: 50, objectFit: "contain" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
            <img src={SUPA + "/ipiranga%20logo.png"} alt="Ipiranga" style={{ maxHeight: 24, maxWidth: "50%", objectFit: "contain" }} />
            <img src={SUPA + "/texaco%20logo.png"} alt="Texaco" style={{ maxHeight: 24, maxWidth: "50%", objectFit: "contain" }} />
          </div>
          <div style={{ fontSize: 11, color: "#bbb" }}>Criado e desenvolvido por Gerth Consultoria</div>
        </div>
      </div>
    );
  }

  // BOAS-VINDAS
  if (tela === "boasvindas") {
    const slides = [
      {
        visual: <div style={{ fontSize: 64, textAlign: "center", padding: "1.5rem 0" }}>🏆</div>,
        titulo: `Bem-vindo, ${user.nome.split(" ")[0]}!`,
        texto: "Você foi selecionado entre nossos melhores clientes para provar que entende de futebol. Faça seus palpites, suba no ranking e conquiste prêmios exclusivos.",
      },
      {
        visual: (
          <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "1.5rem 0" }}>
            {[["3", YELLOW, DARK, "Placar Exato"], ["1", "#fff", DARK, "Vencedor"], ["0", RED, "#fff", "Errou"]].map(([pts, bg, color, label]) => (
              <div key={pts} style={{ textAlign: "center" }}>
                <div style={{ background: bg, color, width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, margin: "0 auto 8px" }}>{pts}</div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{label}</div>
              </div>
            ))}
          </div>
        ),
        titulo: "Como pontuar?",
        texto: "3 pontos pelo placar exato, 1 ponto por acertar o vencedor ou empate. Quanto mais precisão, mais pontos — e mais perto do prêmio.",
      },
      {
        visual: (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 16, padding: "1rem 0" }}>
            {[["🥈", "2º", "#C0C0C0", 44], ["🥇", "1º", YELLOW, 64], ["🥉", "3º", "#CD7F32", 34]].map(([emoji, pos, cor, h]) => (
              <div key={pos} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28 }}>{emoji}</div>
                <div style={{ background: cor, color: DARK, fontWeight: 900, fontSize: 11, width: 48, height: h, borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", margin: "4px auto 0" }}>{pos}</div>
              </div>
            ))}
          </div>
        ),
        titulo: "Disputando o Top 10",
        texto: "Acompanhe sua posição no ranking em tempo real. Os melhores colocados ao final da Copa ganham prêmios exclusivos em produtos Ipiranga e Texaco.",
      },
      {
        visual: <div style={{ fontSize: 56, textAlign: "center", padding: "1.5rem 0" }}>⚠️</div>,
        titulo: "Atenção!",
        texto: "Os palpites fecham automaticamente no apito inicial de cada jogo. Sem exceções. Não deixe para a última hora — cada jogo é uma chance de pontos.",
      },
      {
        visual: (
          <div style={{ textAlign: "center", padding: "1rem 0", width: "100%" }}>
            <img src={SUPA + "/Logo%20branca%20sem%20fundo.png"} alt="Bet Lube" style={{ height: 140, width: "auto", objectFit: "contain" }} />
          </div>
        ),
        titulo: "É só isso!",
        texto: "Você está pronto para jogar. Boa sorte — que vençam os melhores palpites!",
      },
    ];

    return (
      <div style={{ position: "relative", fontFamily: "Inter, Arial, sans-serif", minHeight: "100vh", overflow: "hidden", background: DARK }}>
        <div style={{ pointerEvents: "none", userSelect: "none", opacity: 0.3 }}>
          <Banner />
          <div style={{ padding: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ height: 70, background: CARD, borderRadius: 10, border: "0.5px solid " + BORDER }} />
              <div style={{ height: 70, background: CARD, borderRadius: 10, border: "0.5px solid " + BORDER }} />
            </div>
            {[1,2,3].map(i => <div key={i} style={{ height: 100, background: CARD, borderRadius: 12, border: "0.5px solid " + BORDER, marginBottom: 10 }} />)}
          </div>
        </div>
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.7)" }}>
          <Carrossel slides={slides} onFim={() => setTela("jogos")} />
        </div>
      </div>
    );
  }

  // APP PRINCIPAL
  return (
    <div style={{ fontFamily: "Inter, Arial, sans-serif", background: DARK, minHeight: "100vh" }}>
      <Banner />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: "2px solid " + RED, background: DARK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ color: RED, fontWeight: 900, fontSize: 13, letterSpacing: 1 }}>⚽ BOLÃO COPA 2026</div>
          <div style={{ width: 1, height: 16, background: "#333" }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{isAdmin ? "Admin" : user.nome}</div>
            {!isAdmin && <div style={{ fontSize: 10, color: "#555" }}>{formatDoc(user.doc)}</div>}
          </div>
        </div>
        <button style={{ cursor: "pointer", border: "0.5px solid #333", borderRadius: 8, padding: "5px 12px", fontSize: 12, background: "transparent", color: "#888" }} onClick={logout}>Sair</button>
      </div>

      {msg && (
        <div style={{ margin: "10px 12px", padding: "8px 14px", borderRadius: 8, background: msg.err ? "#2a0000" : "#002a0a", color: msg.err ? RED : "#2d7a4f", fontSize: 13, border: "0.5px solid " + (msg.err ? RED : "#2d7a4f") }}>
          {msg.text}
        </div>
      )}

      {!isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "10px 12px 0" }}>
          {[["Seus pontos", meusPts, YELLOW], ["Posição", meuRank > 0 ? meuRank + "º" : "—", "#fff"]].map(([l, v, cor]) => (
            <div key={l} style={{ background: CARD, borderRadius: 10, padding: "10px 14px", border: "0.5px solid " + BORDER }}>
              <div style={{ fontSize: 9, color: "#555", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: cor, lineHeight: 1 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, padding: "10px 12px 0", flexWrap: "wrap" }}>
        {isAdmin
          ? [["admin","Início"],["clientes","Clientes"],["resultados","Resultados"],["ranking","Ranking"]].map(([t, l]) => (
              <button key={t} style={{ cursor: "pointer", padding: "5px 14px", borderRadius: 20, border: "0.5px solid " + (tela === t ? RED : "#333"), fontSize: 12, background: tela === t ? RED : "transparent", color: tela === t ? "#fff" : "#888", fontWeight: tela === t ? 700 : 400 }}
                onClick={async () => {
                  setTela(t);
                  if (t === "clientes") await carregarClientes();
                  if (t === "resultados") await carregarJogos();
                  if (t === "ranking") { await carregarJogos(); await carregarClientes(); await carregarTodosPalpites(); }
                }}>{l}</button>
            ))
          : [["jogos","Palpites"],["ranking","Ranking"]].map(([t, l]) => (
              <button key={t} style={{ cursor: "pointer", padding: "5px 14px", borderRadius: 20, border: "0.5px solid " + (tela === t ? RED : "#333"), fontSize: 12, background: tela === t ? RED : "transparent", color: tela === t ? "#fff" : "#888", fontWeight: tela === t ? 700 : 400 }}
                onClick={async () => {
                  setTela(t);
                  if (t === "ranking") { await carregarClientes(); await carregarTodosPalpites(); }
                }}>{l}</button>
            ))
        }
      </div>

      {tela === "admin" && (
        <div style={{ background: CARD, border: "0.5px solid " + BORDER, borderRadius: 12, padding: "1rem 1.25rem", margin: "12px" }}>
          <p style={{ margin: 0, fontSize: 14, color: "#888" }}>Use o menu acima para gerenciar clientes, inserir resultados e acompanhar o ranking.</p>
        </div>
      )}

      {tela === "clientes" && <AdminClientes clientes={clientes} onAdd={addCliente} onToggle={toggleCliente} />}
      {tela === "resultados" && <AdminResultados jogos={jogos} onSalvar={salvarResultado} />}
      {tela === "ranking" && <RankingView ranking={ranking} myId={user.id} />}
      {tela === "jogos" && <ListaJogos jogos={jogos} palpites={palpites} onSalvar={salvarPalpite} />}
    </div>
  );
}

function Carrossel({ slides, onFim }) {
  const [atual, setAtual] = useState(0);
  const slide = slides[atual];
  const isUltimo = atual === slides.length - 1;
  const isPrimeiro = atual === 0;
  return (
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ background: "#0a0a1a", minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <button onClick={onFim} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        {slide.visual}
      </div>
      <div style={{ padding: "1.25rem 1.5rem 0.75rem" }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: DARK, marginBottom: 8, fontFamily: "Arial Black, sans-serif" }}>{slide.titulo}</div>
        <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{slide.texto}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.5rem 1rem" }}>
        <button onClick={() => setAtual(atual - 1)} disabled={isPrimeiro} style={{ background: isPrimeiro ? "#f0f0f0" : "#f0f0f0", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: 18, cursor: isPrimeiro ? "default" : "pointer", color: isPrimeiro ? "#ccc" : "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <div style={{ display: "flex", gap: 6 }}>
          {slides.map((_, i) => (
            <div key={i} onClick={() => setAtual(i)} style={{ width: i === atual ? 24 : 8, height: 8, borderRadius: 4, background: i === atual ? RED : "#ddd", cursor: "pointer", transition: "width 0.2s" }} />
          ))}
        </div>
        {isUltimo ? (
          <button onClick={onFim} style={{ background: RED, color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "Arial Black, sans-serif", textTransform: "uppercase" }}>Palpitar →</button>
        ) : (
          <button onClick={() => setAtual(atual + 1)} style={{ background: RED, color: "#fff", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
        )}
      </div>
      {!isUltimo && (
        <div style={{ textAlign: "center", paddingBottom: 16 }}>
          <span onClick={onFim} style={{ color: "#aaa", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Pular introdução</span>
        </div>
      )}
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
    <div style={{ padding: "12px" }}>
      {ranking.length === 0 && <p style={{ fontSize: 14, color: "#555" }}>Nenhum palpite ainda.</p>}
      {podio.length >= 1 && (
        <div style={{ background: CARD, borderRadius: 14, padding: "1.25rem 1rem 0", marginBottom: 12, overflow: "hidden", border: "0.5px solid " + BORDER }}>
          <div style={{ textAlign: "center", color: YELLOW, fontSize: 9, fontWeight: 700, letterSpacing: 3, marginBottom: 12, textTransform: "uppercase" }}>Pódio</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>
            {ordem.map(idx => {
              const c = podio[idx];
              if (!c) return <div key={idx} style={{ flex: 1 }} />;
              const conf = cfg[idx];
              return (
                <div key={c.id} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 2, fontWeight: 500 }}>{c.nome.split(" ")[0]}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: conf.cor, marginBottom: 3 }}>{c.pts}pts</div>
                  <div style={{ background: conf.cor, borderRadius: "6px 6px 0 0", height: conf.altura, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    <div style={{ fontSize: 22 }}>{conf.emoji}</div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: DARK }}>{conf.pos}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {resto.length > 0 && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#555", letterSpacing: 2, padding: "4px 0 8px", textTransform: "uppercase" }}>Classificação geral</div>
          {resto.map((c, i) => (
            <div key={c.id} style={{ background: c.id === myId ? "#1a0000" : CARD, border: "0.5px solid " + (c.id === myId ? RED : BORDER), borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#555", minWidth: 24 }}>{i + 4}º</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13, color: "#fff" }}>{c.nome}</div>
                <div style={{ fontSize: 11, color: "#555" }}>{c.acertos} placar(es) exato(s)</div>
              </div>
              {c.id === myId && <span style={{ fontSize: 9, color: RED, fontWeight: 700, marginRight: 4 }}>VOCÊ</span>}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#fff" }}>{c.pts}</div>
                <div style={{ fontSize: 10, color: "#555" }}>pts</div>
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
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return (
    <div style={{ padding: "10px 0" }}>
      <div style={{ display: "flex", gap: 6, padding: "0 12px 10px", flexWrap: "wrap" }}>
        {RODADAS.map(r => (
          <button key={r.id} onClick={() => setRodada(r.id)} style={{ cursor: "pointer", padding: "4px 12px", borderRadius: 20, border: "0.5px solid " + (rodada === r.id ? RED : "#333"), background: rodada === r.id ? RED : "transparent", color: rodada === r.id ? "#fff" : "#888", fontSize: 12, fontWeight: rodada === r.id ? 700 : 400 }}>{r.label}</button>
        ))}
      </div>
      {Object.keys(grupos).sort().map(dia => (
        <div key={dia}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 12px 10px" }}>
            <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
            <span style={{ fontSize: 10, color: "#555", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }}>{formatDia(dia)}</span>
            <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
          </div>
          {grupos[dia].map(j => {
            const p = palpites.find(x => x.jogo_id === j.id);
            const passou = new Date(j.data_hora) < new Date();
            const pts = p && j.resultado_g1 != null ? calcPontos(p.g1, p.g2, j.resultado_g1, j.resultado_g2) : null;
            const isBrasil = j.time1 === "Brasil" || j.time2 === "Brasil";
            return (
              <div key={j.id} style={{ background: CARD, borderRadius: 12, padding: "10px 12px", marginBottom: 8, marginLeft: 12, marginRight: 12, borderLeft: isBrasil ? "3px solid " + YELLOW : "0.5px solid " + BORDER, borderTop: "0.5px solid " + BORDER, borderRight: "0.5px solid " + BORDER, borderBottom: "0.5px solid " + BORDER }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ background: isBrasil ? "#1a1400" : "#1a1a1a", color: isBrasil ? YELLOW : "#666", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, letterSpacing: 1 }}>GRP {j.grupo} · {formatHora(j.data_hora)}</div>
                  {pts !== null && <span style={{ fontSize: 10, borderRadius: 6, padding: "2px 8px", background: pts === 3 ? "#1a0a00" : pts === 1 ? "#1a1500" : "#1a1a1a", color: pts === 3 ? YELLOW : pts === 1 ? "#fff" : "#555" }}>{pts === 3 ? "⭐ +3" : pts === 1 ? "✓ +1" : "✗ Errou"}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <Flag time={j.time1} size={40} />
                    <div style={{ fontWeight: 600, fontSize: 11, marginTop: 5, color: isBrasil && j.time1 === "Brasil" ? YELLOW : "#fff" }}>{j.time1}</div>
                  </div>
                  <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                    {passou || j.encerrado ? (
                      <div>
                        {j.encerrado ? <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>{j.resultado_g1} — {j.resultado_g2}</div> : <div style={{ fontSize: 12, color: "#555" }}>Em andamento</div>}
                        {p ? <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>Palpite: {p.g1}×{p.g2}</div> : <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>Sem palpite</div>}
                      </div>
                    ) : (
                      <PalpiteInput jogoId={j.id} palpiteAtual={p} onSalvar={onSalvar} isBrasil={isBrasil} />
                    )}
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}><Flag time={j.time2} size={40} /></div>
                    <div style={{ fontWeight: 600, fontSize: 11, marginTop: 5, color: isBrasil && j.time2 === "Brasil" ? YELLOW : "#fff" }}>{j.time2}</div>
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
  const inp = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "0.5px solid " + BORDER, fontSize: 14, background: "#1a1a1a", color: "#fff" };
  return (
    <div style={{ padding: "12px" }}>
      <div style={{ background: CARD, border: "0.5px solid " + BORDER, borderRadius: 12, padding: "1rem", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Novo cliente</div>
        <div style={{ display: "grid", gap: 8 }}>
          <input style={inp} placeholder="CPF ou CNPJ (só números)" value={doc} onChange={e => setDoc(e.target.value)} />
          <input style={inp} placeholder="Nome / Razão social" value={nome} onChange={e => setNome(e.target.value)} />
          <input style={inp} placeholder="Senha inicial" value={senha} onChange={e => setSenha(e.target.value)} />
          <button style={{ cursor: "pointer", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, background: RED, color: "#fff", fontWeight: 700 }} onClick={async () => { await onAdd(doc, nome, senha); setDoc(""); setNome(""); setSenha(""); }}>Adicionar</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>{clientes.filter(c => c.doc !== "admin" && c.ativo).length} clientes ativos</div>
      {clientes.filter(c => c.doc !== "admin").map(c => (
        <div key={c.id} style={{ background: CARD, border: "0.5px solid " + BORDER, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, opacity: c.ativo ? 1 : 0.4 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: "#fff" }}>{c.nome}</div>
            <div style={{ fontSize: 11, color: "#555" }}>{c.doc}</div>
          </div>
          <button style={{ cursor: "pointer", border: "0.5px solid #333", borderRadius: 6, padding: "4px 10px", fontSize: 11, background: "transparent", color: "#888" }} onClick={() => onToggle(c.id, c.ativo)}>{c.ativo ? "Desativar" : "Ativar"}</button>
        </div>
      ))}
    </div>
  );
}

function AdminResultados({ jogos, onSalvar }) {
  function formatData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return (
    <div style={{ padding: "12px" }}>
      {jogos.map(j => (
        <div key={j.id} style={{ background: CARD, border: "0.5px solid " + BORDER, borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Grupo {j.grupo}</span>
            <span style={{ fontSize: 10, color: "#444" }}>{formatData(j.data_hora)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 500, flex: 1, display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 12 }}><Flag time={j.time1} size={18} />{j.time1}</span>
            <ResultInput jogo={j} onSalvar={onSalvar} />
            <span style={{ fontWeight: 500, flex: 1, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, color: "#fff", fontSize: 12 }}>{j.time2}<Flag time={j.time2} size={18} /></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultInput({ jogo, onSalvar }) {
  const [g1, setG1] = useState(jogo.resultado_g1 != null ? jogo.resultado_g1 : "");
  const [g2, setG2] = useState(jogo.resultado_g2 != null ? jogo.resultado_g2 : "");
  const num = { width: 44, textAlign: "center", padding: "5px 2px", borderRadius: 6, border: "0.5px solid " + BORDER, fontSize: 16, fontWeight: 700, background: "#1a1a1a", color: "#fff" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <input style={num} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#444" }}>×</span>
        <input style={num} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button style={{ cursor: "pointer", border: "none", borderRadius: 6, padding: "3px 10px", fontSize: 11, background: RED, color: "#fff", fontWeight: 700 }} onClick={() => onSalvar(jogo.id, g1, g2)}>
        {jogo.encerrado ? "Atualizar" : "Confirmar"}
      </button>
      {jogo.encerrado && <span style={{ fontSize: 10, color: "#2d7a4f" }}>✓ {jogo.resultado_g1}×{jogo.resultado_g2}</span>}
    </div>
  );
}

function PalpiteInput({ jogoId, palpiteAtual, onSalvar, isBrasil }) {
  const [g1, setG1] = useState(palpiteAtual ? palpiteAtual.g1 : "");
  const [g2, setG2] = useState(palpiteAtual ? palpiteAtual.g2 : "");
  const borderColor = isBrasil ? YELLOW : BORDER;
  const num = { width: 44, textAlign: "center", padding: "5px 2px", borderRadius: 6, border: "0.5px solid " + borderColor, fontSize: 16, fontWeight: 700, background: "#1a1a1a", color: "#fff" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <input style={num} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#444" }}>×</span>
        <input style={num} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button style={{ cursor: "pointer", border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 10, background: palpiteAtual ? "#a00614" : RED, color: "#fff", fontWeight: 700 }}
        onClick={() => onSalvar(jogoId, g1, g2)} disabled={g1 === "" || g2 === ""}>
        {palpiteAtual ? "Atualizar" : "Salvar"}
      </button>
    </div>
  );
}
