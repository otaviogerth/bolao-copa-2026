"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const RED = "#D8091B";
const YELLOW = "#FFD101";
const BLUE = "#0045B5";
const DARK = "#080808";
const CARD = "#0F0F0F";
const CARD_HOVER = "#161616";
const BORDER = "#1F1F1F";
const BORDER_BRIGHT = "#2a2a2a";
const TEXT_DIM = "#666";
const TEXT_MUTE = "#888";
const SHADOW_SM = "0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)";
const SHADOW_MD = "0 4px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)";
const SHADOW_LG = "0 8px 48px rgba(0,0,0,0.8), 0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)";
const GLOW_RED = "0 0 24px rgba(216,9,27,0.35), 0 0 64px rgba(216,9,27,0.12)";
const GLOW_YELLOW = "0 0 24px rgba(255,209,1,0.35), 0 0 64px rgba(255,209,1,0.12)";
const SUPA = "https://gdkvezigujpaqqavablu.supabase.co/storage/v1/object/public/assets";

// Tipografia: títulos em Bebas/Oswald (similar ao Helvetica Now Black), corpo em Inter
const FONT_DISPLAY = "'Bebas Neue', 'Oswald', 'Helvetica Neue', Impact, sans-serif";
const FONT_BODY = "'Inter', -apple-system, system-ui, sans-serif";

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
  if (!cod) return null;
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

// CSS global com fontes e animações
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      body { background: ${DARK}; }

      @keyframes fadeIn   { from { opacity: 0; transform: translateY(8px);  } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideUp  { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes scaleIn  { from { opacity: 0; transform: scale(0.94);      } to { opacity: 1; transform: scale(1);    } }
      @keyframes screenIn { from { opacity: 0; transform: translateY(12px) scale(0.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes shimmer  { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes glowPulseRed    { 0%,100% { box-shadow: 0 0 12px rgba(216,9,27,0.2); } 50% { box-shadow: 0 0 28px rgba(216,9,27,0.5); } }
      @keyframes glowPulseYellow { 0%,100% { box-shadow: 0 0 12px rgba(255,209,1,0.2); } 50% { box-shadow: 0 0 28px rgba(255,209,1,0.5); } }
      @keyframes borderGlow { 0%,100% { border-color: rgba(216,9,27,0.4); } 50% { border-color: rgba(216,9,27,0.9); } }

      .fade-in   { animation: fadeIn   0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .slide-up  { animation: slideUp  0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .scale-in  { animation: scaleIn  0.35s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .screen-in { animation: screenIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }

      .stagger > * { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .stagger > *:nth-child(1)  { animation-delay: 0.04s; }
      .stagger > *:nth-child(2)  { animation-delay: 0.09s; }
      .stagger > *:nth-child(3)  { animation-delay: 0.14s; }
      .stagger > *:nth-child(4)  { animation-delay: 0.19s; }
      .stagger > *:nth-child(5)  { animation-delay: 0.24s; }
      .stagger > *:nth-child(6)  { animation-delay: 0.29s; }
      .stagger > *:nth-child(7)  { animation-delay: 0.34s; }
      .stagger > *:nth-child(n+8){ animation-delay: 0.38s; }

      .card-hover {
        transition: transform 0.25s cubic-bezier(0.16,1,0.3,1),
                    box-shadow 0.25s cubic-bezier(0.16,1,0.3,1),
                    background 0.25s ease,
                    border-color 0.25s ease;
      }
      .card-deep {
        background: linear-gradient(160deg, #141414 0%, #0d0d0d 100%);
        box-shadow: ${SHADOW_MD};
      }
      .card-brasil {
        box-shadow: 0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,209,1,0.15), inset 0 1px 0 rgba(255,255,255,0.04);
      }
      .card-brasil:hover {
        box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,209,1,0.35), inset 0 1px 0 rgba(255,255,255,0.06) !important;
      }

      .btn-press { transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1); }
      .btn-press:active { transform: scale(0.97); filter: brightness(0.95); }

      .pill { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }

      .dot { transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease; }

      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      input[type="number"] { -moz-appearance: textfield; }
      input:focus, button:focus { outline: none; }
      input {
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        font-family: ${FONT_BODY};
      }
      input:focus {
        border-color: ${RED} !important;
        box-shadow: 0 0 0 3px rgba(216,9,27,0.12) !important;
      }
      ::selection { background: ${RED}; color: white; }

      .stat-card-pts  { background: linear-gradient(135deg, #1a0a05 0%, #0f0f0f 60%); box-shadow: ${SHADOW_MD}, inset 0 0 40px rgba(255,209,1,0.04); }
      .stat-card-rank { background: linear-gradient(135deg, #0a0a1a 0%, #0f0f0f 60%); box-shadow: ${SHADOW_MD}; }

      .nav-bar {
        border-bottom: 1.5px solid transparent;
        background: linear-gradient(${DARK}, ${DARK}) padding-box,
                    linear-gradient(90deg, transparent 0%, ${RED} 40%, ${RED} 60%, transparent 100%) border-box;
      }

      .score-display {
        background: linear-gradient(160deg, #1a1a1a, #111);
        border-radius: 10px;
        box-shadow: inset 0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03);
        padding: 6px 10px;
        min-width: 52px;
        text-align: center;
      }
      .cal-scroll { overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
      .cal-scroll::-webkit-scrollbar { display: none; }
      @media (hover: hover) and (pointer: fine) {
        .card-hover:hover { background: ${CARD_HOVER} !important; border-color: #2f2f2f !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05) !important; }
        .btn-press:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .pill:hover { background: ${CARD_HOVER}; }
      }
    `}</style>
  );
}

function Banner() {
  return (
    <div style={{ width: "100%", background: DARK, display: "flex", alignItems: "stretch", justifyContent: "space-between", minHeight: 110, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(216,9,27,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(216,9,27,0.4) 30%, rgba(216,9,27,0.4) 70%, transparent)", zIndex: 2 }} />
      <img src={SUPA + "/listras%20esquerda.png"} alt="" style={{ height: 140, width: 80, objectFit: "contain", objectPosition: "left", display: "block", flexShrink: 0, position: "relative", zIndex: 3 }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 3 }}>
        <img src={SUPA + "/Logo%20branca%20sem%20fundo.png"} alt="Bet Lube" style={{ height: 100, width: "auto", objectFit: "contain", filter: "drop-shadow(0 4px 16px rgba(216,9,27,0.25))" }} />
      </div>
      <img src={SUPA + "/listras%20direita.png"} alt="" style={{ height: 140, width: 80, objectFit: "cover", objectPosition: "top", display: "block", flexShrink: 0, position: "relative", zIndex: 3 }} />
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
  const [competicao, setCompeticao] = useState("cliente");

  const isAdmin = user && user.doc === "admin";

  async function login(doc, senha) {
    setLoading(true); setLoginErr("");
    const docLimpo = doc.replace(/\D/g, "") || doc;
    let q = supabase.from("clientes").select("*").eq("doc", docLimpo).eq("senha", senha).eq("ativo", true);
    if (docLimpo !== "admin") q = q.eq("tipo", competicao);
    const { data, error } = await q.limit(1);
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
    flash("Palpite salvo");
  }

  async function salvarResultado(jogoId, g1, g2) {
    await supabase.from("jogos").update({ resultado_g1: parseInt(g1), resultado_g2: parseInt(g2), encerrado: true }).eq("id", jogoId);
    await carregarJogos();
    flash("Resultado salvo");
  }

  async function addCliente(doc, nome, senha, tipo) {
    const { error } = await supabase.from("clientes").insert({ doc: doc.replace(/\D/g, ""), nome, senha, ativo: true, tipo: tipo || "cliente" });
    if (error) { flash("Erro: CPF/CNPJ já cadastrado", true); return; }
    await carregarClientes();
    flash("Cliente adicionado");
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
      <>
        <GlobalStyles />
        <div style={{ fontFamily: FONT_BODY, background: "#f7f7f7", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
          <div className="fade-in"><Banner /></div>
          <div style={{ flex: 1, padding: "2rem 2rem 1rem", maxWidth: 480, width: "100%", margin: "0 auto" }}>
            <div className="slide-up" style={{ fontSize: 60, fontWeight: 400, color: DARK, letterSpacing: 1, marginBottom: "0.5rem", fontFamily: FONT_DISPLAY, lineHeight: 1 }}>LOGIN</div>
            <div className="slide-up" style={{ fontSize: 13, color: "#999", marginBottom: "1.5rem", fontWeight: 400, animationDelay: "0.05s" }}>Selecione sua competição para entrar</div>

            <div className="slide-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.75rem", animationDelay: "0.08s" }}>
              {[["cliente", "COMPETIÇÃO\nCLIENTES"], ["funcionario", "COMPETIÇÃO\nFUNCIONÁRIOS"]].map(([val, label]) => (
                <button key={val} className="btn-press" onClick={() => setCompeticao(val)} style={{ cursor: "pointer", padding: "16px 12px", borderRadius: 10, border: competicao === val ? `2px solid ${RED}` : "2px solid #e0e0e0", background: competicao === val ? RED : "transparent", color: competicao === val ? "#fff" : "#888", fontWeight: 700, fontSize: 10, letterSpacing: 1.5, fontFamily: FONT_BODY, textTransform: "uppercase", whiteSpace: "pre-line", lineHeight: 1.5, textAlign: "center", boxShadow: competicao === val ? "0 4px 16px rgba(216,9,27,0.25)" : "none" }}>{label}</button>
              ))}
            </div>

            <div className="slide-up" style={{ marginBottom: "1.5rem", animationDelay: "0.1s" }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 8, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>CNPJ ou CPF</div>
              <input id="doc" style={{ width: "100%", border: "none", borderBottom: "2px solid #e0e0e0", outline: "none", fontSize: 16, padding: "10px 0", background: "transparent", color: DARK, fontWeight: 500 }} />
            </div>
            <div className="slide-up" style={{ marginBottom: "2.5rem", animationDelay: "0.15s" }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 8, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" }}>Senha</div>
              <input id="senha" type="password" style={{ width: "100%", border: "none", borderBottom: "2px solid #e0e0e0", outline: "none", fontSize: 16, padding: "10px 0", background: "transparent", color: DARK, fontWeight: 500 }}
                onKeyDown={e => e.key === "Enter" && login(document.getElementById("doc").value, document.getElementById("senha").value)} />
            </div>
            {loginErr && <p className="fade-in" style={{ color: RED, fontSize: 13, marginBottom: 16, fontWeight: 600, background: "rgba(216,9,27,0.06)", padding: "10px 14px", borderRadius: 8, border: "0.5px solid rgba(216,9,27,0.2)" }}>{loginErr}</p>}
            <button className="btn-press slide-up" style={{ width: "100%", background: DARK, color: "#fff", border: "none", padding: "17px", fontSize: 13, fontWeight: 700, letterSpacing: 3, cursor: "pointer", opacity: loading ? 0.6 : 1, fontFamily: FONT_BODY, borderRadius: 4, animationDelay: "0.2s", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
              onClick={() => login(document.getElementById("doc").value, document.getElementById("senha").value)} disabled={loading}>
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </button>
          </div>
          <div className="fade-in" style={{ padding: "1.5rem 2rem 0.75rem", textAlign: "center", animationDelay: "0.3s" }}>
            <div style={{ fontSize: 10, color: "#bbb", letterSpacing: 2, marginBottom: 16, fontWeight: 600, textTransform: "uppercase" }}>Parceiros</div>
            <div style={{ marginBottom: "1.25rem" }}>
              <img src={SUPA + "/bel%20lube%20logo.png"} alt="Bel Lube" style={{ maxHeight: 50, objectFit: "contain" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
              <img src={SUPA + "/ipiranga%20logo.png"} alt="Ipiranga" style={{ maxHeight: 26, maxWidth: "50%", objectFit: "contain" }} />
              <img src={SUPA + "/texaco%20logo.png"} alt="Texaco" style={{ maxHeight: 26, maxWidth: "50%", objectFit: "contain" }} />
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "0.75rem", fontSize: 9, color: "#bbb", letterSpacing: 1, fontWeight: 400 }}>
            Desenvolvido por <span style={{ fontWeight: 700, color: "#888" }}>Gerth Consultoria</span>
          </div>
        </div>
      </>
    );
  }

  // BOAS-VINDAS
  if (tela === "boasvindas") {
    const slides = [
      {
        visual: <Visual1 />,
        titulo: `Bem-vindo, ${user.nome.split(" ")[0]}`,
        texto: "Você foi selecionado entre nossos melhores clientes para provar que entende de futebol. Faça seus palpites, suba no ranking e conquiste prêmios exclusivos.",
      },
      {
        visual: <Visual2 />,
        titulo: "Como pontuar",
        texto: "3 pontos pelo placar exato, 1 ponto por acertar o vencedor ou empate. Quanto mais precisão, mais pontos — e mais perto do prêmio.",
      },
      {
        visual: <Visual3 />,
        titulo: "Disputando o Top 10",
        texto: "Acompanhe sua posição no ranking em tempo real. Os melhores colocados ao final da Copa ganham prêmios exclusivos em produtos Ipiranga e Texaco.",
      },
      {
        visual: <Visual4 />,
        titulo: "Atenção",
        texto: "Os palpites fecham automaticamente no apito inicial de cada jogo. Sem exceções. Não deixe para a última hora — cada jogo é uma chance.",
      },
      {
        visual: <Visual5 />,
        titulo: "Tudo pronto",
        texto: "Você está pronto para jogar. Boa sorte — que vençam os melhores palpites.",
      },
    ];

    return (
      <>
        <GlobalStyles />
        <div style={{ position: "relative", fontFamily: FONT_BODY, minHeight: "100vh", overflow: "hidden", background: DARK }}>
          <div style={{ pointerEvents: "none", userSelect: "none", opacity: 0.25, filter: "blur(2px)" }}>
            <Banner />
            <div style={{ padding: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div style={{ height: 70, background: CARD, borderRadius: 10, border: "0.5px solid " + BORDER }} />
                <div style={{ height: 70, background: CARD, borderRadius: 10, border: "0.5px solid " + BORDER }} />
              </div>
              {[1,2,3].map(i => <div key={i} style={{ height: 100, background: CARD, borderRadius: 12, border: "0.5px solid " + BORDER, marginBottom: 10 }} />)}
            </div>
          </div>
          <div className="fade-in" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}>
            <Carrossel slides={slides} onFim={() => setTela("jogos")} />
          </div>
        </div>
      </>
    );
  }

  // APP PRINCIPAL
  return (
    <>
      <GlobalStyles />
      <div style={{ fontFamily: FONT_BODY, background: DARK, minHeight: "100vh", color: "#fff" }}>
        <Banner />
        <div className="fade-in nav-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: DARK }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ color: RED, fontWeight: 400, fontSize: 20, letterSpacing: 2.5, fontFamily: FONT_DISPLAY, textShadow: "0 0 20px rgba(216,9,27,0.5)" }}>BET LUBE</div>
            <div style={{ width: 1, height: 18, background: "#2a2a2a" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{isAdmin ? "Admin" : user.nome}</div>
              {!isAdmin && <div style={{ fontSize: 10, color: TEXT_DIM, marginTop: 2 }}>{formatDoc(user.doc)}</div>}
            </div>
          </div>
          <button className="btn-press" style={{ cursor: "pointer", border: "0.5px solid #2a2a2a", borderRadius: 6, padding: "6px 14px", fontSize: 12, background: "rgba(255,255,255,0.04)", color: TEXT_MUTE, fontWeight: 500 }} onClick={logout}>Sair</button>
        </div>

        {msg && (
          <div className="fade-in" style={{ margin: "12px 14px 0", padding: "11px 16px", borderRadius: 10, background: msg.err ? "#180202" : "#021408", color: msg.err ? "#ff6b6b" : "#4ade80", fontSize: 13, border: "0.5px solid " + (msg.err ? "rgba(216,9,27,0.35)" : "rgba(74,222,128,0.25)"), fontWeight: 600, boxShadow: msg.err ? "0 0 16px rgba(216,9,27,0.1)" : "0 0 16px rgba(74,222,128,0.08)" }}>
            {msg.text}
          </div>
        )}

        {!isAdmin && (
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "14px 14px 0" }}>
            {[["Seus pontos", meusPts, YELLOW, "stat-card-pts"], ["Posição", meuRank > 0 ? meuRank + "º" : "—", "#fff", "stat-card-rank"]].map(([l, v, cor, cls]) => (
              <div key={l} className={"card-hover " + cls} style={{ borderRadius: 14, padding: "16px 18px", border: "0.5px solid " + BORDER_BRIGHT, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: cor === YELLOW ? `linear-gradient(90deg, transparent, ${YELLOW}, transparent)` : `linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)`, opacity: 0.6 }} />
                <div style={{ fontSize: 10, color: TEXT_DIM, marginBottom: 8, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: 36, fontWeight: 400, color: cor, lineHeight: 1, fontFamily: FONT_DISPLAY, letterSpacing: 1, textShadow: cor === YELLOW ? "0 0 20px rgba(255,209,1,0.4)" : "none" }}>{v}</div>
              </div>
            ))}
          </div>
        )}

        <div className="fade-in" style={{ display: "flex", gap: 6, padding: "14px 14px 0", flexWrap: "wrap" }}>
          {isAdmin
            ? [["admin","Início"],["clientes","Clientes"],["resultados","Resultados"],["ranking","Ranking"]].map(([t, l]) => (
                <button key={t} className="pill btn-press" style={{ cursor: "pointer", padding: "6px 14px", borderRadius: 20, border: "0.5px solid " + (tela === t ? RED : "#2a2a2a"), fontSize: 12, background: tela === t ? RED : "transparent", color: tela === t ? "#fff" : TEXT_MUTE, fontWeight: tela === t ? 600 : 500, fontFamily: FONT_BODY }}
                  onClick={async () => {
                    setTela(t);
                    if (t === "clientes") await carregarClientes();
                    if (t === "resultados") await carregarJogos();
                    if (t === "ranking") { await carregarJogos(); await carregarClientes(); await carregarTodosPalpites(); }
                  }}>{l}</button>
              ))
            : [["jogos","Palpites"],["ranking","Ranking"]].map(([t, l]) => (
                <button key={t} className="pill btn-press" style={{ cursor: "pointer", padding: "6px 14px", borderRadius: 20, border: "0.5px solid " + (tela === t ? RED : "#2a2a2a"), fontSize: 12, background: tela === t ? RED : "transparent", color: tela === t ? "#fff" : TEXT_MUTE, fontWeight: tela === t ? 600 : 500, fontFamily: FONT_BODY }}
                  onClick={async () => {
                    setTela(t);
                    if (t === "ranking") { await carregarClientes(); await carregarTodosPalpites(); }
                  }}>{l}</button>
              ))
          }
        </div>

        {tela === "admin" && (
          <div className="screen-in card-deep" style={{ border: "0.5px solid " + BORDER_BRIGHT, borderRadius: 14, padding: "1.5rem", margin: "14px" }}>
            <p style={{ margin: 0, fontSize: 14, color: TEXT_MUTE, lineHeight: 1.7 }}>Use o menu acima para gerenciar clientes, inserir resultados e acompanhar o ranking.</p>
          </div>
        )}

        {tela === "clientes" && <div className="screen-in"><AdminClientes clientes={clientes} onAdd={addCliente} onToggle={toggleCliente} /></div>}
        {tela === "resultados" && <div className="screen-in"><AdminResultados jogos={jogos} onSalvar={salvarResultado} /></div>}
        {tela === "ranking" && <div className="screen-in"><RankingView ranking={ranking} myId={user.id} isAdmin={isAdmin} userTipo={user ? user.tipo : null} /></div>}
        {tela === "jogos" && <div className="screen-in"><ListaJogos jogos={jogos} palpites={palpites} onSalvar={salvarPalpite} /></div>}

        {/* Rodapé minimalista */}
        <div style={{ padding: "2rem 1rem 1.5rem", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 14, opacity: 0.4 }}>
            <img src={SUPA + "/ipiranga%20logo.png"} alt="" style={{ height: 18, filter: "brightness(0) invert(1)" }} />
            <img src={SUPA + "/texaco%20logo.png"} alt="" style={{ height: 18, filter: "brightness(0) invert(1)" }} />
            <img src={SUPA + "/bel%20lube%20logo.png"} alt="" style={{ height: 22, filter: "brightness(0) invert(1)" }} />
          </div>
          <div style={{ fontSize: 9, color: "#333", letterSpacing: 1, fontWeight: 400 }}>
            by <span style={{ color: "#555", fontWeight: 600 }}>Gerth Consultoria</span>
          </div>
        </div>
      </div>
    </>
  );
}

// Visuais ilustrativos para o carrossel (sem emojis)
function Visual1() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="50" fill="none" stroke={YELLOW} strokeWidth="2" strokeDasharray="4 6" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="20s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="60" r="32" fill={YELLOW} />
      <path d="M52 50 L52 72 L72 61 Z" fill={DARK} />
    </svg>
  );
}

function Visual2() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {[["3", YELLOW, "PTS"], ["1", "#fff", "PT"], ["0", "#444", "PTS"]].map(([n, bg, l], i) => (
        <div key={i} className="scale-in" style={{ textAlign: "center", animationDelay: `${0.1 + i * 0.1}s` }}>
          <div style={{ background: bg, color: bg === "#444" ? "#888" : DARK, width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 400, fontFamily: FONT_DISPLAY }}>{n}</div>
          <div style={{ fontSize: 9, color: "#888", marginTop: 6, letterSpacing: 1, fontWeight: 600 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function Visual3() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
      {[
        { h: 50, cor: "#C0C0C0", pos: "2" },
        { h: 75, cor: YELLOW, pos: "1" },
        { h: 38, cor: "#CD7F32", pos: "3" },
      ].map((b, i) => (
        <div key={i} className="scale-in" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
          <div style={{ background: b.cor, width: 48, height: b.h, borderRadius: "8px 8px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: 24, color: DARK, fontWeight: 400 }}>{b.pos}</div>
        </div>
      ))}
    </div>
  );
}

function Visual4() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="scale-in">
      <circle cx="50" cy="50" r="44" fill="none" stroke={RED} strokeWidth="2.5" />
      <rect x="46" y="28" width="8" height="34" rx="2" fill={RED} />
      <circle cx="50" cy="72" r="4" fill={RED} />
    </svg>
  );
}

function Visual5() {
  return (
    <img src={SUPA + "/Logo%20branca%20sem%20fundo.png"} alt="Bet Lube" style={{ height: 130, width: "auto", objectFit: "contain" }} className="scale-in" />
  );
}

function Carrossel({ slides, onFim }) {
  const [atual, setAtual] = useState(0);
  const slide = slides[atual];
  const isUltimo = atual === slides.length - 1;
  const isPrimeiro = atual === 0;
  return (
    <div className="scale-in" style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 460, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.08)" }}>
      <div style={{ background: "#0a0a14", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <button className="btn-press" onClick={onFim} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>×</button>
        <div key={atual} className="fade-in">{slide.visual}</div>
      </div>
      <div style={{ padding: "1.5rem 1.75rem 1rem" }}>
        <div key={"t-" + atual} className="fade-in" style={{ fontSize: 24, fontWeight: 400, color: DARK, marginBottom: 10, fontFamily: FONT_DISPLAY, letterSpacing: 1, lineHeight: 1.1 }}>{slide.titulo}</div>
        <div key={"d-" + atual} className="fade-in" style={{ fontSize: 14, color: "#555", lineHeight: 1.7, animationDelay: "0.05s" }}>{slide.texto}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1.75rem 1rem" }}>
        <button className="btn-press" onClick={() => setAtual(atual - 1)} disabled={isPrimeiro} style={{ background: "transparent", border: "1px solid " + (isPrimeiro ? "#eee" : "#ddd"), width: 40, height: 40, borderRadius: "50%", cursor: isPrimeiro ? "default" : "pointer", color: isPrimeiro ? "#ddd" : "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: isPrimeiro ? 0.4 : 1 }}>←</button>
        <div style={{ display: "flex", gap: 6 }}>
          {slides.map((_, i) => (
            <div key={i} className="dot" onClick={() => setAtual(i)} style={{ width: i === atual ? 28 : 8, height: 8, borderRadius: 4, background: i === atual ? RED : "#ddd", cursor: "pointer" }} />
          ))}
        </div>
        {isUltimo ? (
          <button className="btn-press" onClick={onFim} style={{ background: RED, color: "#fff", border: "none", padding: "11px 18px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: 2, fontFamily: FONT_BODY, textTransform: "uppercase" }}>Palpitar →</button>
        ) : (
          <button className="btn-press" onClick={() => setAtual(atual + 1)} style={{ background: RED, color: "#fff", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
        )}
      </div>
      {!isUltimo && (
        <div style={{ textAlign: "center", paddingBottom: 18 }}>
          <span onClick={onFim} style={{ color: "#bbb", fontSize: 11, cursor: "pointer", textDecoration: "underline", letterSpacing: 0.5 }}>Pular introdução</span>
        </div>
      )}
    </div>
  );
}

function RankingView({ ranking, myId, isAdmin, userTipo }) {
  const tipoInicial = isAdmin ? "cliente" : (userTipo || "cliente");
  const [aba, setAba] = useState(tipoInicial);

  const rankFiltrado = ranking.filter(c => c.tipo === aba);
  const podio = rankFiltrado.slice(0, 3);
  const resto = rankFiltrado.slice(3);
  const ordem = [1, 0, 2];

  const MEDAL = [
    { cor: "#FFD700", grad: "linear-gradient(145deg,#FFD700 0%,#B8860B 55%,#FFD700 100%)", glow: "0 4px 24px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)", border: "rgba(255,215,0,0.6)", altura: 110, pos: "1" },
    { cor: "#C0C0C0", grad: "linear-gradient(145deg,#C0C0C0 0%,#707070 55%,#C0C0C0 100%)", glow: "0 4px 24px rgba(192,192,192,0.3), inset 0 1px 0 rgba(255,255,255,0.25)", border: "rgba(192,192,192,0.5)", altura: 82, pos: "2" },
    { cor: "#CD7F32", grad: "linear-gradient(145deg,#CD7F32 0%,#7B4420 55%,#CD7F32 100%)", glow: "0 4px 24px rgba(205,127,50,0.3), inset 0 1px 0 rgba(255,255,255,0.2)", border: "rgba(205,127,50,0.5)", altura: 65, pos: "3" },
  ];

  return (
    <div style={{ padding: "14px" }}>
      {isAdmin && (
        <div className="fade-in" style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[["cliente", "Clientes"], ["funcionario", "Funcionários"]].map(([val, label]) => (
            <button key={val} className="pill btn-press" onClick={() => setAba(val)} style={{ cursor: "pointer", padding: "6px 16px", borderRadius: 20, border: "0.5px solid " + (aba === val ? RED : "#2a2a2a"), background: aba === val ? RED : "transparent", color: aba === val ? "#fff" : TEXT_MUTE, fontSize: 12, fontWeight: aba === val ? 600 : 500 }}>{label}</button>
          ))}
        </div>
      )}

      {rankFiltrado.length === 0 && <p style={{ fontSize: 14, color: TEXT_DIM, padding: "1rem" }}>Nenhum palpite ainda.</p>}

      {podio.length >= 1 && (
        <div className="scale-in" style={{ borderRadius: 18, padding: "1.5rem 1rem 0", marginBottom: 20, overflow: "hidden", position: "relative", background: "linear-gradient(160deg, #141414 0%, #0d0d0d 100%)", border: "0.5px solid #2a2a2a", boxShadow: `${SHADOW_LG}, inset 0 0 80px rgba(255,215,0,0.02)` }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,215,0,0.6), transparent)" }} />
          <div style={{ textAlign: "center", color: "#FFD700", fontSize: 10, fontWeight: 700, letterSpacing: 4, marginBottom: 20, textTransform: "uppercase", opacity: 0.75 }}>Pódio</div>
          <div className="stagger" style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10 }}>
            {ordem.map((idx) => {
              const c = podio[idx];
              if (!c) return <div key={idx} style={{ flex: 1 }} />;
              const m = MEDAL[idx];
              const isMe = c.id === myId;
              return (
                <div key={c.id} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: isMe ? RED : TEXT_DIM, marginBottom: 3, fontWeight: isMe ? 700 : 400, letterSpacing: isMe ? 1.5 : 0.5, textTransform: "uppercase" }}>{isMe ? "Você" : c.nome.split(" ")[0]}</div>
                  <div style={{ fontSize: 20, fontWeight: 400, color: m.cor, marginBottom: 8, fontFamily: FONT_DISPLAY, letterSpacing: 0.5, textShadow: `0 0 16px ${m.cor}60` }}>{c.pts}<span style={{ fontSize: 9, opacity: 0.65, marginLeft: 1 }}>pts</span></div>
                  <div style={{ background: m.grad, borderRadius: "10px 10px 0 0", height: m.altura, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: m.glow, border: `1px solid ${m.border}`, borderBottom: "none" }}>
                    <div style={{ fontSize: 34, fontWeight: 400, color: "#111", fontFamily: FONT_DISPLAY, lineHeight: 1 }}>{m.pos}</div>
                    <div style={{ fontSize: 7, fontWeight: 800, color: "rgba(0,0,0,0.5)", letterSpacing: 1.5, marginTop: 3 }}>LUGAR</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {resto.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_DIM, letterSpacing: 2, padding: "0.25rem 0 0.75rem", textTransform: "uppercase" }}>Classificação geral</div>
          <div className="stagger">
            {resto.map((c, i) => {
              const isMe = c.id === myId;
              return (
                <div key={c.id} className="card-hover" style={{ background: isMe ? "linear-gradient(135deg, #1a0303 0%, #0f0f0f 100%)" : "linear-gradient(160deg, #141414, #0d0d0d)", border: "0.5px solid " + (isMe ? "rgba(216,9,27,0.55)" : BORDER_BRIGHT), borderRadius: 12, padding: "13px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14, boxShadow: isMe ? `${SHADOW_MD}, 0 0 20px rgba(216,9,27,0.12)` : SHADOW_SM }}>
                  <span style={{ fontSize: 16, fontWeight: 400, color: TEXT_DIM, minWidth: 30, fontFamily: FONT_DISPLAY }}>{i + 4}º</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: "#fff" }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 2 }}>{c.acertos} placar(es) exato(s)</div>
                  </div>
                  {isMe && <span style={{ fontSize: 9, color: RED, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Você</span>}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 400, fontSize: 22, color: "#fff", fontFamily: FONT_DISPLAY, letterSpacing: 0.5 }}>{c.pts}</div>
                    <div style={{ fontSize: 9, color: TEXT_DIM, letterSpacing: 1, textTransform: "uppercase" }}>pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ListaJogos({ jogos, palpites, onSalvar }) {
  const [rodada, setRodada] = useState("todas");
  const [diaSel, setDiaSel] = useState(null);

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
  const dias = Object.keys(grupos).sort();

  useEffect(() => {
    if (dias.length === 0) { setDiaSel(null); return; }
    const hoje = new Date().toISOString().slice(0, 10);
    const proximo = dias.find(d => d >= hoje) || dias[dias.length - 1];
    setDiaSel(proximo);
  }, [rodada, jogos.length]); // eslint-disable-line

  function scrollParaDia(dia) {
    setDiaSel(dia);
    setTimeout(() => {
      const el = document.getElementById("dia-" + dia);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 10);
  }

  function formatDia(iso) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  }
  function formatHora(iso) {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  function formatCalDia(iso) {
    const d = new Date(iso + "T12:00:00");
    const sem = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "").toUpperCase();
    const mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
    return { sem, num: d.getDate(), mes };
  }

  return (
    <div style={{ padding: "14px 0" }}>
      <div className="fade-in" style={{ display: "flex", gap: 6, padding: "0 14px 12px", flexWrap: "wrap" }}>
        {RODADAS.map(r => (
          <button key={r.id} className="pill btn-press" onClick={() => setRodada(r.id)} style={{ cursor: "pointer", padding: "5px 14px", borderRadius: 20, border: "0.5px solid " + (rodada === r.id ? RED : "#2a2a2a"), background: rodada === r.id ? RED : "transparent", color: rodada === r.id ? "#fff" : TEXT_MUTE, fontSize: 12, fontWeight: rodada === r.id ? 600 : 500 }}>{r.label}</button>
        ))}
      </div>

      {dias.length > 0 && (
        <div className="cal-scroll fade-in" style={{ display: "flex", gap: 8, padding: "0 14px 16px" }}>
          {dias.map(dia => {
            const { sem, num, mes } = formatCalDia(dia);
            const ativo = dia === diaSel;
            return (
              <button key={dia} className="btn-press" onClick={() => scrollParaDia(dia)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "9px 13px", borderRadius: 11, border: ativo ? `1.5px solid ${RED}` : "0.5px solid #2a2a2a", background: ativo ? RED : "rgba(255,255,255,0.03)", cursor: "pointer", gap: 2, boxShadow: ativo ? "0 4px 16px rgba(216,9,27,0.3)" : "none", minWidth: 52 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: ativo ? "rgba(255,255,255,0.75)" : TEXT_DIM, letterSpacing: 1 }}>{sem}</span>
                <span style={{ fontSize: 24, fontWeight: 400, color: "#fff", fontFamily: FONT_DISPLAY, lineHeight: 1.1 }}>{num}</span>
                <span style={{ fontSize: 9, fontWeight: 600, color: ativo ? "rgba(255,255,255,0.65)" : TEXT_DIM, letterSpacing: 0.5 }}>{mes}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="stagger">
        {dias.map(dia => (
          <div key={dia} id={"dia-" + dia}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px" }}>
              <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
              <span style={{ fontSize: 10, color: TEXT_DIM, fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap", letterSpacing: 1 }}>{formatDia(dia)}</span>
              <div style={{ flex: 1, height: "0.5px", background: BORDER }} />
            </div>
            {grupos[dia].map(j => {
              const p = palpites.find(x => x.jogo_id === j.id);
              const passou = new Date(j.data_hora) < new Date();
              const pts = p && j.resultado_g1 != null ? calcPontos(p.g1, p.g2, j.resultado_g1, j.resultado_g2) : null;
              const isBrasil = j.time1 === "Brasil" || j.time2 === "Brasil";
              return (
                <div key={j.id} className={"card-hover " + (isBrasil ? "card-brasil" : "card-deep")} style={{ borderRadius: 14, padding: "14px 14px", marginBottom: 10, marginLeft: 14, marginRight: 14, position: "relative", overflow: "hidden", border: isBrasil ? "1px solid rgba(255,209,1,0.18)" : "0.5px solid " + BORDER_BRIGHT }}>
                  {isBrasil && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${YELLOW}, transparent)`, opacity: 0.7 }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ background: isBrasil ? "rgba(255,209,1,0.1)" : "rgba(255,255,255,0.05)", color: isBrasil ? YELLOW : TEXT_DIM, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5, letterSpacing: 1, border: isBrasil ? "0.5px solid rgba(255,209,1,0.2)" : "0.5px solid rgba(255,255,255,0.07)" }}>GRP {j.grupo} · {formatHora(j.data_hora)}</div>
                    {pts !== null && (
                      <span style={{ fontSize: 10, borderRadius: 6, padding: "3px 10px", fontWeight: 700, letterSpacing: 0.5,
                        background: pts === 3 ? "rgba(255,209,1,0.15)" : pts === 1 ? "rgba(255,255,255,0.08)" : "rgba(216,9,27,0.1)",
                        color: pts === 3 ? YELLOW : pts === 1 ? "#fff" : "#555",
                        border: pts === 3 ? "0.5px solid rgba(255,209,1,0.3)" : pts === 1 ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(216,9,27,0.2)",
                        boxShadow: pts === 3 ? "0 0 8px rgba(255,209,1,0.2)" : "none"
                      }}>{pts === 3 ? "+3 EXATO" : pts === 1 ? "+1 VENCEDOR" : "ERROU"}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <Flag time={j.time1} size={44} />
                      <div style={{ fontWeight: 600, fontSize: 12, marginTop: 7, color: isBrasil && j.time1 === "Brasil" ? YELLOW : "#fff", letterSpacing: 0.3, textShadow: isBrasil && j.time1 === "Brasil" ? "0 0 12px rgba(255,209,1,0.4)" : "none" }}>{j.time1}</div>
                    </div>
                    <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                      {passou || j.encerrado ? (
                        <div>
                          {j.encerrado
                            ? <div className="score-display" style={{ fontSize: 28, fontWeight: 400, color: "#fff", letterSpacing: 4, fontFamily: FONT_DISPLAY, lineHeight: 1, display: "inline-block" }}>{j.resultado_g1} : {j.resultado_g2}</div>
                            : <div style={{ fontSize: 11, color: TEXT_DIM, fontStyle: "italic" }}>Em andamento</div>}
                          {p ? <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 6, letterSpacing: 0.5 }}>Palpite {p.g1}—{p.g2}</div> : <div style={{ fontSize: 11, color: "#2a2a2a", marginTop: 6 }}>Sem palpite</div>}
                        </div>
                      ) : (
                        <PalpiteInput jogoId={j.id} palpiteAtual={p} onSalvar={onSalvar} isBrasil={isBrasil} />
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}><Flag time={j.time2} size={44} /></div>
                      <div style={{ fontWeight: 600, fontSize: 12, marginTop: 7, color: isBrasil && j.time2 === "Brasil" ? YELLOW : "#fff", letterSpacing: 0.3, textShadow: isBrasil && j.time2 === "Brasil" ? "0 0 12px rgba(255,209,1,0.4)" : "none" }}>{j.time2}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminClientes({ clientes, onAdd, onToggle }) {
  const [doc, setDoc] = useState(""); const [nome, setNome] = useState(""); const [senha, setSenha] = useState(""); const [tipo, setTipo] = useState("cliente");
  const inp = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "0.5px solid " + BORDER, fontSize: 14, background: "#161616", color: "#fff", fontFamily: FONT_BODY };
  return (
    <div style={{ padding: "14px" }}>
      <div className="scale-in card-deep" style={{ border: "0.5px solid " + BORDER_BRIGHT, borderRadius: 14, padding: "1.25rem", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${RED}, transparent)`, opacity: 0.5 }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 14 }}>Novo cadastro</div>
        <div style={{ display: "grid", gap: 10 }}>
          <input style={inp} placeholder="CPF ou CNPJ (só números)" value={doc} onChange={e => setDoc(e.target.value)} />
          <input style={inp} placeholder="Nome / Razão social" value={nome} onChange={e => setNome(e.target.value)} />
          <input style={inp} placeholder="Senha inicial" value={senha} onChange={e => setSenha(e.target.value)} />
          <select style={{ ...inp, cursor: "pointer" }} value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="funcionario">Funcionário</option>
          </select>
          <button className="btn-press" style={{ cursor: "pointer", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, background: RED, color: "#fff", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }} onClick={async () => { await onAdd(doc, nome, senha, tipo); setDoc(""); setNome(""); setSenha(""); setTipo("cliente"); }}>Adicionar</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: TEXT_DIM, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>{clientes.filter(c => c.doc !== "admin" && c.ativo).length} cadastros ativos</div>
      <div className="stagger">
      {clientes.filter(c => c.doc !== "admin").map(c => (
        <div key={c.id} className="card-hover" style={{ background: "linear-gradient(160deg,#141414,#0d0d0d)", border: "0.5px solid " + BORDER_BRIGHT, borderRadius: 12, padding: "13px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, opacity: c.ativo ? 1 : 0.4, boxShadow: SHADOW_SM }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: "#fff" }}>{c.nome}</div>
            <div style={{ fontSize: 11, color: TEXT_DIM, marginTop: 3, display: "flex", alignItems: "center", gap: 8 }}>
              <span>{c.doc}</span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: c.tipo === "funcionario" ? "#60a5fa" : YELLOW, background: c.tipo === "funcionario" ? "rgba(96,165,250,0.1)" : "rgba(255,209,1,0.1)", padding: "2px 6px", borderRadius: 4, border: "0.5px solid " + (c.tipo === "funcionario" ? "rgba(96,165,250,0.25)" : "rgba(255,209,1,0.25)") }}>{c.tipo === "funcionario" ? "FUNC" : "CLI"}</span>
            </div>
          </div>
          <button className="btn-press" style={{ cursor: "pointer", border: "0.5px solid #2a2a2a", borderRadius: 6, padding: "5px 12px", fontSize: 11, background: "transparent", color: TEXT_MUTE, fontWeight: 500 }} onClick={() => onToggle(c.id, c.ativo)}>{c.ativo ? "Desativar" : "Ativar"}</button>
        </div>
      ))}
      </div>
    </div>
  );
}

function AdminResultados({ jogos, onSalvar }) {
  function formatData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return (
    <div className="stagger" style={{ padding: "14px" }}>
      {jogos.map(j => (
        <div key={j.id} className="card-hover card-deep" style={{ border: "0.5px solid " + BORDER_BRIGHT, borderRadius: 14, padding: "13px 14px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: TEXT_DIM, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Grupo {j.grupo}</span>
            <span style={{ fontSize: 10, color: TEXT_DIM }}>{formatData(j.data_hora)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 500, flex: 1, display: "flex", alignItems: "center", gap: 8, color: "#fff", fontSize: 12 }}><Flag time={j.time1} size={20} />{j.time1}</span>
            <ResultInput jogo={j} onSalvar={onSalvar} />
            <span style={{ fontWeight: 500, flex: 1, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, color: "#fff", fontSize: 12 }}>{j.time2}<Flag time={j.time2} size={20} /></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultInput({ jogo, onSalvar }) {
  const [g1, setG1] = useState(jogo.resultado_g1 != null ? jogo.resultado_g1 : "");
  const [g2, setG2] = useState(jogo.resultado_g2 != null ? jogo.resultado_g2 : "");
  const num = { width: 44, textAlign: "center", padding: "6px 2px", borderRadius: 6, border: "0.5px solid " + BORDER, fontSize: 16, fontWeight: 600, background: "#161616", color: "#fff", fontFamily: FONT_DISPLAY };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <input style={num} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#333", fontSize: 12 }}>×</span>
        <input style={num} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button className="btn-press" style={{ cursor: "pointer", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 10, background: RED, color: "#fff", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }} onClick={() => onSalvar(jogo.id, g1, g2)}>
        {jogo.encerrado ? "Atualizar" : "Salvar"}
      </button>
      {jogo.encerrado && <span style={{ fontSize: 10, color: "#4ade80", letterSpacing: 0.5 }}>{jogo.resultado_g1}—{jogo.resultado_g2}</span>}
    </div>
  );
}

function PalpiteInput({ jogoId, palpiteAtual, onSalvar, isBrasil }) {
  const [g1, setG1] = useState(palpiteAtual ? palpiteAtual.g1 : "");
  const [g2, setG2] = useState(palpiteAtual ? palpiteAtual.g2 : "");
  const borderColor = isBrasil ? "rgba(255,209,1,0.4)" : "#2a2a2a";
  const num = { width: 48, textAlign: "center", padding: "8px 2px", borderRadius: 8, border: "1px solid " + borderColor, fontSize: 20, fontWeight: 400, background: "linear-gradient(160deg,#1a1a1a,#111)", color: "#fff", fontFamily: FONT_DISPLAY, boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)" };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input style={num} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#333", fontSize: 14 }}>×</span>
        <input style={num} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button className="btn-press" style={{ cursor: "pointer", border: "none", borderRadius: 20, padding: "6px 16px", fontSize: 10, background: palpiteAtual ? "#5a020e" : RED, color: "#fff", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", boxShadow: g1 !== "" && g2 !== "" ? "0 2px 12px rgba(216,9,27,0.35)" : "none", opacity: g1 === "" || g2 === "" ? 0.5 : 1 }}
        onClick={() => onSalvar(jogoId, g1, g2)} disabled={g1 === "" || g2 === ""}>
        {palpiteAtual ? "Atualizar" : "Salvar"}
      </button>
    </div>
  );
}
