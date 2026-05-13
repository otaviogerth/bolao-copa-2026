"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const RED    = "#D8091B";
const YELLOW = "#FFD101";
const DARK   = "#111318"; // azul-aço escuro — menos pesado que preto puro
const CARD   = "#181c24";
const CARD2  = "#1a1e28";
const BORDER = "#252a36";
const BORDER2= "#2e3444";
const DIM    = "#6b7280";
const MUTE   = "#8b95a8";
const SUPA   = "https://gdkvezigujpaqqavablu.supabase.co/storage/v1/object/public/assets";
const LOGO_BRANCA   = SUPA + "/bet%20lube%20branca.png";
const LOGO_PRETA    = SUPA + "/bet%20lube%20preta.png";
const LOGO_VERMELHA = SUPA + "/bet%20lube%20vermelha.png";

// Tipografia: FIFATournament para display/títulos, Ubuntu para corpo
const FD = "'FIFATournament','Impact',sans-serif"; // títulos e display principal
const FO = "'FIFATournament','Impact',sans-serif"; // mesmo — fonte FIFA para tudo display
const FB = "'Ubuntu',sans-serif"; // corpo

// Sombras com tint escuro (skill: tint shadows to background hue)
const SH_SM = "0 1px 3px rgba(0,0,0,0.5),0 1px 2px rgba(0,0,0,0.4)";
const SH_MD = "0 4px 16px rgba(0,0,0,0.6),0 1px 4px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)";
const SH_LG = "0 8px 40px rgba(0,0,0,0.75),0 2px 8px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)";

const CODIGOS = {
  "México":"mx","África do Sul":"za","Coreia do Sul":"kr","Rep. Tcheca":"cz",
  "Canadá":"ca","Bósnia":"ba","Qatar":"qa","Suíça":"ch",
  "Brasil":"br","Marrocos":"ma","Haiti":"ht","Escócia":"gb-sct",
  "Estados Unidos":"us","Paraguai":"py","Austrália":"au","Turquia":"tr",
  "Alemanha":"de","Curaçao":"cw","Costa do Marfim":"ci","Equador":"ec",
  "Holanda":"nl","Japão":"jp","Suécia":"se","Tunísia":"tn",
  "Espanha":"es","Cabo Verde":"cv","Arábia Saudita":"sa","Uruguai":"uy",
  "Bélgica":"be","Egito":"eg","Irã":"ir","Nova Zelândia":"nz",
  "França":"fr","Senegal":"sn","Iraque":"iq","Noruega":"no",
  "Argentina":"ar","Argélia":"dz","Áustria":"at","Jordânia":"jo",
  "Portugal":"pt","RD Congo":"cd","Uzbequistão":"uz","Colômbia":"co",
  "Inglaterra":"gb-eng","Croácia":"hr","Gana":"gh","Panamá":"pa",
};

function Flag({ time, size = 32 }) {
  const cod = CODIGOS[time];
  if (!cod) return null;
  const upper = cod.includes("-") ? cod.split("-")[0].toUpperCase() : cod.toUpperCase();
  return (
    <img
      src={`https://flagsapi.com/${upper}/flat/64.png`}
      width={size} height={size}
      style={{ borderRadius: 3, objectFit: "cover", display: "block" }}
      alt={time}
    />
  );
}

function calcPontos(g1, g2, rg1, rg2) {
  if (rg1 == null || rg2 == null) return null;
  if (g1 === rg1 && g2 === rg2) return 3;
  const v = (a, b) => a > b ? 1 : b > a ? 2 : 0;
  return v(g1, g2) === v(rg1, rg2) ? 1 : 0;
}

function formatDoc(doc) {
  const d = doc.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
}

/* ─── GLOBAL STYLES ─────────────────────────────────────────────────────── */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap');
      @font-face {
        font-family: 'FIFATournament';
        src: url('https://gdkvezigujpaqqavablu.supabase.co/storage/v1/object/public/assets/FIFATournament-Black.woff') format('woff');
        font-weight: 900;
        font-style: normal;
        font-display: swap;
      }
      *,*::before,*::after{box-sizing:border-box;}
      *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
      html{scroll-behavior:smooth;}
      body{background:${DARK};margin:0;}

      /* Keyframes — apenas transform+opacity (hardware accelerated) */
      @keyframes fadeUp   {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes scaleIn  {from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
      @keyframes shimmer  {0%{background-position:-200% 0}100%{background-position:200% 0}}

      /* Ease curves premium (Emil Kowalski) */
      :root{
        --ease-out:cubic-bezier(0.16,1,0.3,1);
        --ease-in-out:cubic-bezier(0.77,0,0.175,1);
      }

      .fade-up  {animation:fadeUp  0.35s var(--ease-out) both;}
      .scale-in {animation:scaleIn 0.3s  var(--ease-out) both;}

      /* Stagger via CSS custom property (sem JS) */
      .stagger>*{animation:fadeUp 0.35s var(--ease-out) both;}
      .stagger>*:nth-child(1){animation-delay:30ms}
      .stagger>*:nth-child(2){animation-delay:60ms}
      .stagger>*:nth-child(3){animation-delay:90ms}
      .stagger>*:nth-child(4){animation-delay:120ms}
      .stagger>*:nth-child(5){animation-delay:120ms}
      .stagger>*:nth-child(6){animation-delay:144ms}
      .stagger>*:nth-child(7){animation-delay:168ms}
      .stagger>*:nth-child(n+8){animation-delay:190ms}

      /* Transição de tela */
      .screen{animation:fadeUp 0.3s var(--ease-out) both;}

      /* Card base — gradiente sutil para dar profundidade */
      .card{
        background:linear-gradient(160deg,#1c2030 0%,#161a26 100%);
        border:0.5px solid ${BORDER2};
        transition:
          transform 200ms var(--ease-out),
          box-shadow 200ms var(--ease-out),
          border-color 200ms ease;
      }
      /* Hover only em dispositivos com mouse (skill) */
      @media(hover:hover)and(pointer:fine){
        .card:hover{
          transform:translateY(-2px);
          border-color:#303030;
          box-shadow:0 8px 28px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .card-brasil:hover{
          border-color:rgba(255,209,1,0.4)!important;
          box-shadow:0 8px 28px rgba(0,0,0,0.65),0 0 0 1px rgba(255,209,1,0.15),inset 0 1px 0 rgba(255,255,255,0.04)!important;
        }
      }

      /* Botões — feedback tátil (skill Rule 5) */
      .btn{
        transition:transform 160ms var(--ease-out),filter 160ms ease,box-shadow 160ms ease;
        cursor:pointer;
      }
      .btn:active{transform:scale(0.97);filter:brightness(0.92);}
      @media(hover:hover)and(pointer:fine){
        .btn:hover{transform:translateY(-1px);filter:brightness(1.1);}
      }

      /* Pill nav */
      .pill{
        transition:background 160ms ease,border-color 160ms ease,color 160ms ease,transform 160ms cubic-bezier(0.16,1,0.3,1);
        cursor:pointer;
      }

      /* Inputs */
      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
      input[type="number"]{-moz-appearance:textfield;}
      input:focus,button:focus{outline:none;}
      input{transition:border-color 180ms ease,box-shadow 180ms ease;font-family:${FB};}
      input:focus{border-color:${RED}!important;box-shadow:0 0 0 3px rgba(216,9,27,0.14)!important;}
      ::selection{background:${RED};color:#fff;}

      /* Skeleton shimmer (skill: skeletal loaders) */
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      .skeleton{
        background:linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);
        background-size:200% 100%;
        animation:shimmer 1.4s ease infinite;
        border-radius:8px;
      }

      /* prefers-reduced-motion (skill: acessibilidade) */
      @media(prefers-reduced-motion:reduce){
        *{animation:none!important;}
        *{transition:opacity 150ms ease,color 150ms ease!important;}
      }

      /* Scroll calendário — sem scrollbar */
      .cal-scroll{overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
      .cal-scroll::-webkit-scrollbar{display:none;}

      /* Navbar border-gradient */
      .nav-bar{
        border-bottom:1px solid transparent;
        background:
          linear-gradient(${DARK},${DARK}) padding-box,
          linear-gradient(90deg,transparent 0%,${RED} 40%,${RED} 60%,transparent 100%) border-box;
      }

      /* Score display */
      .score-box{
        background:linear-gradient(160deg,#181818,#101010);
        border-radius:8px;
        box-shadow:inset 0 2px 6px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.03);
        padding:5px 10px;min-width:50px;text-align:center;
      }

      /* Liquid glass — refração com inner border (skill seção 4) */
      .glass{
        border:0.5px solid rgba(255,255,255,0.07);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.07),inset 0 -1px 0 rgba(0,0,0,0.2),0 1px 3px rgba(0,0,0,0.4);
      }
      /* Card com liquid glass completo */
      .card-glass{
        background:linear-gradient(160deg,rgba(28,32,42,0.97) 0%,rgba(20,24,34,0.99) 100%);
        border:0.5px solid rgba(255,255,255,0.08);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -1px 0 rgba(0,0,0,0.2),0 4px 16px rgba(0,0,0,0.35);
        backdrop-filter:blur(0px);
      }
    `}</style>
  );
}

/* ─── BANNER ─────────────────────────────────────────────────────────────── */
function Banner() {
  return (
    <div style={{width:"100%",background:DARK,display:"flex",alignItems:"stretch",justifyContent:"space-between",minHeight:110,position:"relative",overflow:"hidden"}}>
      
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"0.5px",background:"rgba(255,255,255,0.06)",zIndex:2}}/>
      <img src={SUPA+"/listras%20esquerda.png"} alt="" style={{height:140,width:80,objectFit:"contain",objectPosition:"left",display:"block",flexShrink:0,position:"relative",zIndex:3}}/>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:3}}>
        <img src={LOGO_BRANCA} alt="Bet Lube" style={{height:100,width:"auto",objectFit:"contain",opacity:0.95}}/>
      </div>
      <img src={SUPA+"/listras%20direita.png"} alt="" style={{height:140,width:80,objectFit:"cover",objectPosition:"top",display:"block",flexShrink:0,position:"relative",zIndex:3}}/>
    </div>
  );
}

/* ─── APP ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [user,setUser]         = useState(null);
  const [tela,setTela]         = useState("login");
  const [loginErr,setLoginErr] = useState("");
  const [loading,setLoading]   = useState(false);
  const [jogos,setJogos]       = useState([]);
  const [palpites,setPalpites] = useState([]);
  const [clientes,setClientes] = useState([]);
  const [msg,setMsg]           = useState("");
  const [competicao,setCompeticao] = useState("cliente");

  const isAdmin = user?.doc === "admin";

  async function login(doc, senha) {
    setLoading(true); setLoginErr("");
    const docNumerico = doc.replace(/\D/g,"");
    // Se só tem números usa o doc limpo, senão usa o original (funcionários com nome como login)
    const docLimpo = docNumerico.length > 0 ? docNumerico : doc.trim();
    let q = supabase.from("clientes").select("*").eq("doc",docLimpo).eq("senha",senha).eq("ativo",true);
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

  async function carregarJogos()              { const {data}=await supabase.from("jogos").select("*").order("data_hora"); setJogos(data||[]); }
  async function carregarPalpites(id)         { const {data}=await supabase.from("palpites").select("*").eq("cliente_id",id); setPalpites(data||[]); }
  async function carregarClientes()           { const {data}=await supabase.from("clientes").select("*").order("nome"); setClientes(data||[]); }
  async function carregarTodosPalpites()      { const {data}=await supabase.from("palpites").select("*"); setPalpites(data||[]); }
  function logout()                           { setUser(null);setTela("login");setJogos([]);setPalpites([]);setClientes([]); }
  function flash(text,err)                    { setMsg({text,err});setTimeout(()=>setMsg(""),2500); }

  async function salvarPalpite(jogoId,g1,g2) {
    const exist = palpites.find(p=>p.jogo_id===jogoId);
    if (exist) await supabase.from("palpites").update({g1:parseInt(g1),g2:parseInt(g2)}).eq("id",exist.id);
    else       await supabase.from("palpites").insert({cliente_id:user.id,jogo_id:jogoId,g1:parseInt(g1),g2:parseInt(g2)});
    await carregarPalpites(user.id);
    flash("Palpite salvo");
  }

  async function salvarResultado(jogoId,g1,g2) {
    await supabase.from("jogos").update({resultado_g1:parseInt(g1),resultado_g2:parseInt(g2),encerrado:true}).eq("id",jogoId);
    await carregarJogos();
    flash("Resultado salvo");
  }

  async function addCliente(doc,nome,senha,tipo) {
    const {error}=await supabase.from("clientes").insert({doc:doc.replace(/\D/g,""),nome,senha,ativo:true,tipo:tipo||"cliente"});
    if (error) { flash("Erro: CPF/CNPJ já cadastrado",true); return; }
    await carregarClientes();
    flash("Cliente adicionado");
  }

  async function toggleCliente(id,ativo) {
    await supabase.from("clientes").update({ativo:!ativo}).eq("id",id);
    await carregarClientes();
  }

  async function zerarResultados() {
    if (!confirm("Zerar TODOS os resultados? Os palpites serão mantidos.")) return;
    await supabase.from("jogos").update({resultado_g1:null,resultado_g2:null,encerrado:false});
    await carregarJogos();
    flash("Todos os resultados foram zerados");
  }

  const ranking = clientes.filter(c=>c.doc!=="admin").map(c=>{
    let pts=0,acertos=0;
    jogos.forEach(j=>{
      const p=palpites.find(x=>x.cliente_id===c.id&&x.jogo_id===j.id);
      if (!p||j.resultado_g1==null) return;
      const pp=calcPontos(p.g1,p.g2,j.resultado_g1,j.resultado_g2);
      pts+=pp; if(pp===3)acertos++;
    });
    return {...c,pts,acertos};
  }).sort((a,b)=>b.pts-a.pts||b.acertos-a.acertos);

  const meuRank = user ? ranking.findIndex(r=>r.id===user.id)+1 : 0;
  const meusPts = user ? (ranking.find(r=>r.id===user.id)||{}).pts||0 : 0;

  /* ── LOGIN ── */
  if (tela==="login") return (
    <>
      <GlobalStyles/>
      <div style={{fontFamily:FB,background:"#f8f7f5",minHeight:"100dvh",display:"flex",flexDirection:"column"}}>
        <div className="fade-up"><Banner/></div>

        <div style={{flex:1,padding:"2rem 1.5rem 1rem",maxWidth:440,width:"100%",margin:"0 auto"}}>
          {/* Título */}
          <div className="fade-up" style={{fontFamily:FO,fontSize:52,fontWeight:800,color:"#111",letterSpacing:-1,lineHeight:1,marginBottom:4}}>LOGIN</div>
          <div className="fade-up" style={{fontSize:12,color:MUTE,marginBottom:"1.75rem",animationDelay:"40ms",letterSpacing:0.3}}>
            Selecione sua competição para entrar
          </div>

          {/* Seleção de competição */}
          <div className="fade-up" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:"1.75rem",animationDelay:"70ms"}}>
            {[["cliente","CLIENTES"],["funcionario","FUNCIONÁRIOS"]].map(([val,label])=>(
              <button key={val} className="btn" onClick={()=>setCompeticao(val)} style={{
                padding:"18px 10px",borderRadius:10,
                border:`1.5px solid ${competicao===val ? RED : BORDER2}`,
                background: competicao===val ? `linear-gradient(135deg,${RED},#a30614)` : "transparent",
                color: competicao===val ? "#fff" : DIM,
                fontFamily:FB, fontWeight:700, fontSize:9, letterSpacing:2,
                textTransform:"uppercase", lineHeight:1.6, textAlign:"center",
                boxShadow: competicao===val ? `0 4px 20px rgba(216,9,27,0.3),inset 0 1px 0 rgba(255,255,255,0.1)` : "none",
              }}>
                <div style={{fontSize:8,opacity:0.7,marginBottom:3}}>COMPETIÇÃO</div>
                {label}
              </button>
            ))}
          </div>

          {/* Campos */}
          <div className="fade-up" style={{marginBottom:"1.25rem",animationDelay:"100ms"}}>
            <div style={{fontSize:10,color:"#999",marginBottom:8,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>CPF ou CNPJ</div>
            <input id="doc" style={{width:"100%",border:"none",borderBottom:"1.5px solid #ddd",outline:"none",fontSize:16,padding:"10px 0",background:"transparent",color:"#111",fontWeight:500}}/>
          </div>
          <div className="fade-up" style={{marginBottom:"2rem",animationDelay:"130ms"}}>
            <div style={{fontSize:10,color:"#999",marginBottom:8,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Senha</div>
            <input id="senha" type="password" style={{width:"100%",border:"none",borderBottom:"1.5px solid #ddd",outline:"none",fontSize:16,padding:"10px 0",background:"transparent",color:"#111",fontWeight:500}}
              onKeyDown={e=>e.key==="Enter"&&login(document.getElementById("doc").value,document.getElementById("senha").value)}/>
          </div>

          {loginErr && (
            <div className="fade-up" style={{color:"#ff4d4d",fontSize:12,marginBottom:14,fontWeight:600,background:"rgba(216,9,27,0.08)",padding:"10px 14px",borderRadius:8,border:"0.5px solid rgba(216,9,27,0.25)"}}>
              {loginErr}
            </div>
          )}

          <button className="btn fade-up" style={{
            width:"100%",border:"none",padding:"16px",
            fontSize:12,fontWeight:700,letterSpacing:2,
            background:`linear-gradient(135deg,${RED},#a30614)`,
            color:"#fff",
            borderRadius:6,animationDelay:"160ms",
            border:"none",
            boxShadow:"0 4px 20px rgba(216,9,27,0.35)",
            opacity: loading ? 0.6 : 1,
          }} onClick={()=>login(document.getElementById("doc").value,document.getElementById("senha").value)} disabled={loading}>
            {loading?"ENTRANDO...":"ENTRAR"}
          </button>
        </div>

        {/* Rodapé logos */}
        <div className="fade-up" style={{padding:"1.5rem 1.5rem 0.5rem",textAlign:"center",animationDelay:"200ms"}}>
          <div style={{fontSize:9,color:"#333",letterSpacing:2,marginBottom:14,fontWeight:600,textTransform:"uppercase"}}>Parceiros</div>
          <div style={{marginBottom:"1rem"}}>
            <img src={SUPA+"/bel%20lube%20logo.png"} alt="Bel Lube" style={{maxHeight:44,objectFit:"contain",filter:"brightness(0)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:"1.25rem"}}>
            <img src={SUPA+"/ipiranga%20logo.png"} alt="Ipiranga" style={{maxHeight:22,objectFit:"contain",filter:"brightness(0)"}}/>
            <img src={SUPA+"/texaco%20logo.png"} alt="Texaco" style={{maxHeight:22,objectFit:"contain",filter:"brightness(0)"}}/>
          </div>
        </div>
        <div style={{textAlign:"center",padding:"0.5rem",fontSize:9,color:"#2a2a2a",letterSpacing:1}}>
          by <span style={{color:"#444",fontWeight:600}}>Gerth Consultoria</span>
        </div>
      </div>
    </>
  );

  /* ── BOAS-VINDAS ── */
  if (tela==="boasvindas") {
    const slides=[
      {visual:<Visual1/>,titulo:`Bem-vindo, ${user.nome.split(" ")[0]}`,texto:"Você foi selecionado entre nossos melhores clientes para provar que entende de futebol. Faça seus palpites, suba no ranking e conquiste prêmios exclusivos."},
      {visual:<Visual2/>,titulo:"Como pontuar",texto:"3 pontos pelo placar exato, 1 ponto por acertar o vencedor ou empate. Quanto mais precisão, mais pontos — e mais perto do prêmio."},
      {visual:<Visual3/>,titulo:"Disputando o Top 10",texto:"Acompanhe sua posição no ranking em tempo real. Os melhores colocados ao final da Copa ganham prêmios exclusivos em produtos Ipiranga e Texaco."},
      {visual:<Visual4/>,titulo:"Atenção",texto:"Os palpites fecham automaticamente no apito inicial de cada jogo. Sem exceções. Não deixe para a última hora — cada jogo é uma chance."},
      {visual:<Visual5/>,titulo:"Tudo pronto",texto:"Você está pronto para jogar. Boa sorte — que vençam os melhores palpites."},
    ];
    return (
      <>
        <GlobalStyles/>
        <div style={{position:"relative",fontFamily:FB,minHeight:"100vh",overflow:"hidden",background:DARK}}>
          <div style={{pointerEvents:"none",userSelect:"none",opacity:0.2,filter:"blur(2px)"}}>
            <Banner/>
            <div style={{padding:"1rem"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[0,1].map(i=><div key={i} style={{height:70,background:CARD,borderRadius:10,border:`0.5px solid ${BORDER}`}}/>)}
              </div>
              {[0,1,2].map(i=><div key={i} style={{height:100,background:CARD,borderRadius:12,border:`0.5px solid ${BORDER}`,marginBottom:10}}/>)}
            </div>
          </div>
          <div className="fade-up" style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",background:"rgba(0,0,0,0.88)",backdropFilter:"blur(6px)"}}>
            <Carrossel slides={slides} onFim={()=>setTela("jogos")}/>
          </div>
        </div>
      </>
    );
  }

  /* ── APP PRINCIPAL ── */
  return (
    <>
      <GlobalStyles/>
      <div style={{fontFamily:FB,background:DARK,minHeight:"100vh",color:"#fff"}}>
        <Banner/>

        {/* Navbar */}
        <div className="nav-bar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",background:DARK}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src={LOGO_VERMELHA} alt="Bet Lube" style={{height:38,width:"auto",objectFit:"contain"}}/>
            <div style={{width:1,height:16,background:BORDER2}}/>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#e8e8e8",lineHeight:1.2}}>{isAdmin?"Admin":user.nome}</div>
              {!isAdmin&&<div style={{fontSize:10,color:DIM,marginTop:1}}>{formatDoc(user.doc)}</div>}
            </div>
          </div>
          <button className="btn" style={{border:`0.5px solid ${BORDER2}`,borderRadius:6,padding:"5px 13px",fontSize:11,background:"rgba(255,255,255,0.03)",color:MUTE,fontWeight:500}} onClick={logout}>Sair</button>
        </div>

        {/* Flash */}
        {msg&&(
          <div className="fade-up" style={{margin:"10px 14px 0",padding:"10px 14px",borderRadius:8,background:msg.err?"#160202":"#021208",color:msg.err?"#ff6060":"#4ade80",fontSize:12,border:`0.5px solid ${msg.err?"rgba(216,9,27,0.3)":"rgba(74,222,128,0.2)"}`,fontWeight:600}}>
            {msg.text}
          </div>
        )}

        {/* Stats do usuário */}
        {!isAdmin&&(
          <div className="stagger" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"12px 14px 0"}}>
            {[
              {label:"Seus pontos",val:meusPts,cor:YELLOW,bg:"linear-gradient(135deg,rgba(255,209,1,0.08),rgba(28,32,42,0.95))",topBar:`linear-gradient(90deg,transparent,${YELLOW},transparent)`},
              {label:"Posição",val:meuRank>0?meuRank+"º":"—",cor:"#e8e8e8",bg:"linear-gradient(135deg,rgba(216,9,27,0.06),rgba(28,32,42,0.95))",topBar:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)"},
            ].map(({label,val,cor,bg,topBar})=>(
              <div key={label} className="card card-glass" style={{borderRadius:12,padding:"14px 16px",background:bg,position:"relative",overflow:"hidden",boxShadow:`${SH_MD},inset 0 1px 0 rgba(255,255,255,0.09)`}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:topBar,opacity:0.7}}/>
                <div style={{fontSize:9,color:DIM,marginBottom:7,letterSpacing:2,textTransform:"uppercase",fontWeight:700,fontFamily:FO}}>{label}</div>
                <div style={{fontSize:38,fontWeight:400,color:cor,lineHeight:1,fontFamily:FD,letterSpacing:1,textShadow:"none"}}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Nav pills */}
        <div style={{display:"flex",gap:6,padding:"12px 14px 0",flexWrap:"wrap",justifyContent:"center"}}>
          {(isAdmin
            ?[["admin","Início"],["clientes","Clientes"],["resultados","Resultados"],["ranking","Ranking"]]
            :[["jogos","Palpites"],["ranking","Ranking"]]
          ).map(([t,l])=>(
            <button key={t} className="pill btn" style={{
              padding:"5px 14px",borderRadius:20,
              border:tela===t?`1px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
              fontSize:12,
              background:tela===t
                ?`linear-gradient(135deg,${RED},#a30614)`
                :"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
              color:tela===t?"#fff":MUTE,
              fontWeight:tela===t?600:500,
              fontFamily:FB,
              boxShadow:tela===t
                ?"inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)"
                :"inset 0 1px 0 rgba(255,255,255,0.07),inset 0 -1px 0 rgba(0,0,0,0.1)",
            }} onClick={async()=>{
              setTela(t);
              if(t==="clientes")await carregarClientes();
              if(t==="resultados")await carregarJogos();
              if(t==="ranking"){await carregarJogos();await carregarClientes();await carregarTodosPalpites();}
            }}>{l}</button>
          ))}
        </div>

        {/* Telas */}
        {tela==="admin"&&(
          <div className="screen" style={{margin:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
            <div className="card glass" style={{borderRadius:12,padding:"1.25rem",boxShadow:SH_SM}}>
              <p style={{margin:0,fontSize:13,color:MUTE,lineHeight:1.7}}>Use o menu acima para gerenciar clientes, inserir resultados e acompanhar o ranking.</p>
            </div>
            <div className="card glass" style={{borderRadius:12,padding:"1.25rem",boxShadow:SH_SM,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(216,9,27,0.4),transparent)"}}/>
              <div style={{fontSize:12,fontWeight:700,color:"#e0e0e0",marginBottom:4,fontFamily:FO}}>Ferramentas de teste</div>
              <div style={{fontSize:11,color:MUTE,marginBottom:14,lineHeight:1.6}}>Use apenas em ambiente de testes. Zerar resultados mantém todos os palpites intactos.</div>
              <button className="btn" onClick={zerarResultados} style={{
                border:"1px solid rgba(216,9,27,0.4)",borderRadius:8,padding:"10px 18px",
                fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
                background:"rgba(216,9,27,0.08)",color:RED,fontFamily:FB,
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.06)",
              }}>Zerar todos os resultados</button>
            </div>
          </div>
        )}
        {tela==="clientes"  &&<div className="screen"><AdminClientes clientes={clientes} onAdd={addCliente} onToggle={toggleCliente}/></div>}
        {tela==="resultados"&&<div className="screen"><AdminResultados jogos={jogos} onSalvar={salvarResultado}/></div>}
        {tela==="ranking"   &&<div className="screen"><RankingView ranking={ranking} myId={user.id} isAdmin={isAdmin} userTipo={user?.tipo}/></div>}
        {tela==="jogos"     &&<div className="screen"><ListaJogos jogos={jogos} palpites={palpites} onSalvar={salvarPalpite} loading={loading}/></div>}

        {/* Footer */}
        <div style={{padding:"2rem 1rem 1.5rem",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:20,marginBottom:12,opacity:0.3}}>
            <img src={SUPA+"/ipiranga%20logo.png"} alt="" style={{height:16,filter:"brightness(0) invert(1)"}}/>
            <img src={SUPA+"/texaco%20logo.png"}   alt="" style={{height:16,filter:"brightness(0) invert(1)"}}/>
            <img src={SUPA+"/bel%20lube%20logo.png"} alt="" style={{height:20,filter:"brightness(0) invert(1)"}}/>
          </div>
          <div style={{fontSize:9,color:"#2a2a2a",letterSpacing:1}}>by <span style={{color:"#3a3a3a",fontWeight:600}}>Gerth Consultoria</span></div>
        </div>
      </div>
    </>
  );
}

/* ─── VISUAIS CARROSSEL ──────────────────────────────────────────────────── */

// Slide 1: Bem-vindo — troféu da copa estilizado com listras
function Visual1() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" className="scale-in">
      {/* Base do troféu */}
      <rect x="50" y="100" width="30" height="6" rx="3" fill={YELLOW} opacity="0.9"/>
      <rect x="44" y="106" width="42" height="5" rx="2.5" fill={YELLOW} opacity="0.7"/>
      {/* Haste */}
      <rect x="61" y="82" width="8" height="20" rx="2" fill={YELLOW} opacity="0.8"/>
      {/* Copa */}
      <path d="M42 30 Q42 80 65 82 Q88 80 88 30 Z" fill={YELLOW}/>
      {/* Reflexo */}
      <path d="M52 35 Q50 58 58 70" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round"/>
      {/* Alças */}
      <path d="M42 38 Q28 38 28 52 Q28 64 42 62" fill="none" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
      <path d="M88 38 Q102 38 102 52 Q102 64 88 62" fill="none" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
      {/* Estrelas animadas */}
      <circle cx="25" cy="22" r="2.5" fill={RED} opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="105" cy="30" r="2" fill={RED} opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="18" cy="60" r="1.5" fill={YELLOW} opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="112" cy="55" r="2" fill={YELLOW} opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Listras vermelho na copa (identidade Bet Lube) */}
      <clipPath id="c1"><path d="M42 30 Q42 80 65 82 Q88 80 88 30 Z"/></clipPath>
      <rect x="42" y="30" width="8" height="52" fill={RED} opacity="0.25" clipPath="url(#c1)"/>
      <rect x="80" y="30" width="8" height="52" fill={RED} opacity="0.25" clipPath="url(#c1)"/>
    </svg>
  );
}

// Slide 2: Como pontuar — placar de futebol com 3 cenários
function Visual2() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8,width:200}} className="scale-in">
      {[
        {p1:"1",p2:"1",label:"+3 EXATO",cor:YELLOW,bg:"rgba(255,209,1,0.12)",border:"rgba(255,209,1,0.3)"},
        {p1:"2",p2:"0",label:"+1 VENCEDOR",cor:"#d0d0d0",bg:"rgba(255,255,255,0.06)",border:"rgba(255,255,255,0.15)"},
        {p1:"0",p2:"3",label:"ERROU",cor:"#444",bg:"rgba(0,0,0,0.2)",border:"rgba(255,255,255,0.06)"},
      ].map(({p1,p2,label,cor,bg,border},i)=>(
        <div key={i} className="scale-in" style={{
          animationDelay:`${i*80}ms`,
          display:"flex",alignItems:"center",gap:10,
          background:bg,border:`0.5px solid ${border}`,
          borderRadius:10,padding:"8px 12px",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
            <div style={{width:28,height:28,borderRadius:6,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FD,fontSize:18,color:"#fff"}}>{p1}</div>
            <span style={{fontSize:11,color:"#444"}}>×</span>
            <div style={{width:28,height:28,borderRadius:6,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FD,fontSize:18,color:"#fff"}}>{p2}</div>
          </div>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:1,color:cor}}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// Slide 3: Ranking — pódio com barras animadas
function Visual3() {
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90}} className="scale-in">
      {[
        {h:55,cor:"#C0C0C0",pos:"2",delay:"80ms"},
        {h:85,cor:YELLOW,pos:"1",delay:"0ms"},
        {h:40,cor:"#CD7F32",pos:"3",delay:"160ms"},
      ].map((b,i)=>(
        <div key={i} style={{textAlign:"center",animationDelay:b.delay}}>
          <div style={{
            fontFamily:FD,fontSize:10,color:b.cor,marginBottom:4,letterSpacing:0.5
          }}>{i===1?"1º":i===0?"2º":"3º"}</div>
          <div style={{
            width:50,height:b.h,borderRadius:"8px 8px 0 0",
            background:`linear-gradient(180deg,${b.cor} 0%,${b.cor}99 100%)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 0 12px ${b.cor}33`,
          }}>
            <span style={{fontFamily:FD,fontSize:26,color:"rgba(0,0,0,0.65)"}}>{b.pos}</span>
          </div>
          {/* Listras marca */}
          <div style={{width:50,height:4,background:i===1?RED:"rgba(255,255,255,0.1)"}}/>
        </div>
      ))}
    </div>
  );
}

// Slide 4: Atenção — relógio com ponteiros e conta regressiva
function Visual4() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="scale-in">
      {/* Fundo do relógio */}
      <circle cx="60" cy="62" r="42" fill="rgba(216,9,27,0.08)" stroke={RED} strokeWidth="1.5" opacity="0.8"/>
      <circle cx="60" cy="62" r="36" fill="rgba(0,0,0,0.3)"/>
      {/* Marcas de hora */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((ang,i)=>{
        const rad = (ang-90)*Math.PI/180;
        const r1 = i%3===0?28:30, r2=33;
        return <line key={i}
          x1={60+r1*Math.cos(rad)} y1={62+r1*Math.sin(rad)}
          x2={60+r2*Math.cos(rad)} y2={62+r2*Math.sin(rad)}
          stroke={i%3===0?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)"} strokeWidth={i%3===0?2:1}
        />;
      })}
      {/* Ponteiro minutos — posição crítica (quase no zero) */}
      <line x1="60" y1="62" x2="60" y2="34" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 60 62" to="360 60 62" dur="60s" repeatCount="indefinite"/>
      </line>
      {/* Ponteiro horas */}
      <line x1="60" y1="62" x2="75" y2="50" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Centro */}
      <circle cx="60" cy="62" r="4" fill={RED}/>
      <circle cx="60" cy="62" r="2" fill="#fff"/>
      {/* Texto APITO */}
      <text x="60" y="78" textAnchor="middle" fontSize="7" fill={RED} fontWeight="700" letterSpacing="2" fontFamily="FIFATournament,sans-serif">APITA</text>
      {/* Coroa/botão topo */}
      <rect x="57" y="18" width="6" height="8" rx="3" fill={RED} opacity="0.9"/>
    </svg>
  );
}

// Slide 5: Logo final
function Visual5() {
  return (
    <div style={{textAlign:"center"}} className="scale-in">
      <img src={LOGO_BRANCA} alt="Bet Lube" style={{height:110,width:"auto",objectFit:"contain"}}/>
      <div style={{marginTop:12,display:"flex",justifyContent:"center",gap:4}}>
        {[RED,YELLOW,RED].map((c,i)=>(
          <div key={i} style={{width:i===1?24:8,height:3,borderRadius:2,background:c,transition:"width 300ms"}}/>
        ))}
      </div>
    </div>
  );
}

/* ─── CARROSSEL ──────────────────────────────────────────────────────────── */
function Carrossel({ slides, onFim }) {
  const [atual,setAtual] = useState(0);
  const slide = slides[atual];
  const isUltimo = atual===slides.length-1;
  return (
    <div className="scale-in" style={{background:"rgba(255,255,255,0.97)",borderRadius:20,width:"100%",maxWidth:460,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,0.7),0 0 0 0.5px rgba(255,255,255,0.12),inset 0 1px 0 rgba(255,255,255,0.8)"}}>
      {/* Visual area */}
      <div style={{background:"linear-gradient(160deg,#0d0d14,#080810)",minHeight:190,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
        <button className="btn" onClick={onFim} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.07)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>×</button>
        <div key={atual} className="fade-up">{slide.visual}</div>
      </div>
      {/* Texto */}
      <div style={{padding:"1.4rem 1.6rem 0.8rem"}}>
        <div key={"t"+atual} className="fade-up" style={{fontSize:22,fontWeight:800,color:DARK,marginBottom:8,fontFamily:FO,letterSpacing:-0.5,lineHeight:1.15}}>{slide.titulo}</div>
        <div key={"d"+atual} className="fade-up" style={{fontSize:13,color:"#555",lineHeight:1.75,animationDelay:"40ms"}}>{slide.texto}</div>
      </div>
      {/* Controles */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.5rem 1.6rem 0.9rem"}}>
        <button className="btn" onClick={()=>setAtual(atual-1)} disabled={atual===0} style={{background:"transparent",border:`1px solid ${atual===0?"#eee":"#ddd"}`,width:38,height:38,borderRadius:"50%",cursor:atual===0?"default":"pointer",color:atual===0?"#ddd":"#333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,opacity:atual===0?0.35:1}}>←</button>
        <div style={{display:"flex",gap:5}}>
          {slides.map((_,i)=>(
            <div key={i} onClick={()=>setAtual(i)} style={{width:i===atual?26:7,height:7,borderRadius:4,background:i===atual?RED:"#ddd",cursor:"pointer",transition:"width 250ms var(--ease-out),background 200ms ease"}}/>
          ))}
        </div>
        {isUltimo
          ? <button className="btn" onClick={onFim} style={{background:RED,color:"#fff",border:"none",padding:"10px 16px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:2,textTransform:"uppercase"}}>Palpitar →</button>
          : <button className="btn" onClick={()=>setAtual(atual+1)} style={{background:RED,color:"#fff",border:"none",width:38,height:38,borderRadius:"50%",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
        }
      </div>
      {!isUltimo&&(
        <div style={{textAlign:"center",paddingBottom:16}}>
          <span onClick={onFim} style={{color:"#bbb",fontSize:11,cursor:"pointer",textDecoration:"underline",letterSpacing:0.4}}>Pular introdução</span>
        </div>
      )}
    </div>
  );
}

/* ─── RANKING ────────────────────────────────────────────────────────────── */
function RankingView({ ranking, myId, isAdmin, userTipo }) {
  const [aba,setAba] = useState(isAdmin?"cliente":(userTipo||"cliente"));

  const rankFiltrado = ranking.filter(c=>c.tipo===aba);
  const podio = rankFiltrado.slice(0,3);
  const todos  = rankFiltrado; // lista completa incluindo pódio

  const MEDAL = [
    {cor:"#FFD700",grad:"linear-gradient(145deg,#FFD700 0%,#997200 50%,#FFD700 100%)",glow:"inset 0 1px 0 rgba(255,255,255,0.25),inset 0 -1px 0 rgba(0,0,0,0.15)",border:"rgba(255,215,0,0.55)",h:112,pos:"1"},
    {cor:"#C0C0C0",grad:"linear-gradient(145deg,#C0C0C0 0%,#686868 50%,#C0C0C0 100%)",glow:"inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.1)",border:"rgba(192,192,192,0.45)",h:82,pos:"2"},
    {cor:"#CD7F32",grad:"linear-gradient(145deg,#CD7F32 0%,#7A3E18 50%,#CD7F32 100%)",glow:"inset 0 1px 0 rgba(255,255,255,0.18),inset 0 -1px 0 rgba(0,0,0,0.1)",border:"rgba(205,127,50,0.45)",h:64,pos:"3"},
  ];

  return (
    <div style={{padding:"14px"}}>
      {/* Abas admin */}
      {isAdmin&&(
        <div className="fade-up" style={{display:"flex",gap:6,marginBottom:16}}>
          {[["cliente","Clientes"],["funcionario","Funcionários"]].map(([val,label])=>(
            <button key={val} className="pill btn" onClick={()=>setAba(val)} style={{
              padding:"6px 16px",borderRadius:20,
              border:`0.5px solid ${aba===val?RED:BORDER2}`,
              background:aba===val?RED:"transparent",
              color:aba===val?"#fff":MUTE,
              fontSize:12,fontWeight:aba===val?600:500,
            }}>{label}</button>
          ))}
        </div>
      )}

      {rankFiltrado.length===0&&(
        <div style={{textAlign:"center",padding:"3rem 1rem",color:DIM,fontSize:13}}>
          Nenhum palpite registrado ainda.
        </div>
      )}

      {/* Pódio */}
      {podio.length>=1&&(
        <div className="scale-in" style={{
          borderRadius:16,padding:"1.5rem 1rem 0",marginBottom:20,
          overflow:"hidden",position:"relative",
          background:"linear-gradient(160deg,#131313,#0b0b0b)",
          border:`0.5px solid #2a2a2a`,
          boxShadow:`${SH_LG},inset 0 0 60px rgba(255,215,0,0.015)`,
        }}>
          {/* Linha dourada top */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.55),transparent)"}}/>
          <div style={{textAlign:"center",color:"#FFD700",fontSize:9,fontWeight:700,letterSpacing:4,marginBottom:18,textTransform:"uppercase",opacity:0.65}}>Pódio</div>

          <div className="stagger" style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8}}>
            {[1,0,2].map(idx=>{
              const c = podio[idx];
              if (!c) return <div key={idx} style={{flex:1}}/>;
              const m = MEDAL[idx];
              const isMe = c.id===myId;
              return (
                <div key={c.id} style={{flex:1,textAlign:"center"}}>
                  {/* Nome */}
                  <div style={{fontSize:10,color:isMe?RED:DIM,marginBottom:2,fontWeight:isMe?700:400,letterSpacing:isMe?1.5:0.5,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {isMe?"Você":c.nome.split(" ")[0]}
                  </div>
                  {/* Pontos */}
                  <div style={{fontSize:18,fontWeight:400,color:m.cor,marginBottom:7,fontFamily:FD,textShadow:"none"}}>
                    {c.pts}<span style={{fontSize:9,opacity:0.6,marginLeft:1}}>pts</span>
                  </div>
                  {/* Coluna */}
                  <div style={{
                    background:m.grad,borderRadius:"8px 8px 0 0",height:m.h,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                    boxShadow:m.glow,border:`1px solid ${m.border}`,borderBottom:"none",
                  }}>
                    <div style={{fontSize:32,fontWeight:400,color:"rgba(0,0,0,0.75)",fontFamily:FD,lineHeight:1}}>{m.pos}</div>
                    <div style={{fontSize:7,fontWeight:800,color:"rgba(0,0,0,0.4)",letterSpacing:1.5,marginTop:2}}>LUGAR</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista completa — todos os participantes */}
      {todos.length>0&&(
        <>
          <div style={{fontSize:9,fontWeight:700,color:DIM,letterSpacing:2.5,padding:"4px 0 10px",textTransform:"uppercase",fontFamily:FO}}>Classificação completa</div>
          <div className="stagger">
            {todos.map((c,i)=>{
              const isMe = c.id===myId;
              const MEDAL_COLORS = ["#FFD700","#C0C0C0","#CD7F32"];
              const isTop3 = i < 3;
              return (
                <div key={c.id} className="card card-glass" style={{
                  borderRadius:11,padding:"12px 15px",marginBottom:7,
                  display:"flex",alignItems:"center",gap:13,
                  background:isMe?"linear-gradient(135deg,#160202,#0c0c0c)":isTop3?"linear-gradient(135deg,#131108,#0c0c0c)":"linear-gradient(160deg,#111,#0c0c0c)",
                  border:`0.5px solid ${isMe?"rgba(216,9,27,0.4)":isTop3?`${MEDAL_COLORS[i]}22`:BORDER2}`,
                  boxShadow:isMe?`${SH_SM},0 0 10px rgba(216,9,27,0.07)`:SH_SM,
                }}>
                  <div style={{minWidth:32,textAlign:"center"}}>
                    {isTop3
                      ? <div style={{width:26,height:26,borderRadius:"50%",background:MEDAL_COLORS[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"rgba(0,0,0,0.7)",fontFamily:FD}}>{i+1}</div>
                      : <span style={{fontSize:14,fontWeight:400,color:DIM,fontFamily:FD}}>{i+1}º</span>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,fontSize:13,color:"#e0e0e0"}}>{c.nome}</div>
                    <div style={{fontSize:10,color:DIM,marginTop:2}}>{c.acertos} acerto(s) exato(s)</div>
                  </div>
                  {isMe&&<span style={{fontSize:8,color:RED,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>Você</span>}
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:400,fontSize:22,color:isTop3?MEDAL_COLORS[i]:"#d0d0d0",fontFamily:FD}}>{c.pts}</div>
                    <div style={{fontSize:8,color:DIM,letterSpacing:1,textTransform:"uppercase"}}>pts</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── LISTA DE JOGOS ─────────────────────────────────────────────────────── */
function ListaJogos({ jogos, palpites, onSalvar, loading }) {
  const [rodada,setRodada] = useState("1");
  const [diaSel,setDiaSel] = useState(null);
  const calRef = useRef(null);

  const RODADAS = [
    {id:"1",label:"1ª Rodada",inicio:"2026-06-11",fim:"2026-06-17"},
    {id:"2",label:"2ª Rodada",inicio:"2026-06-18",fim:"2026-06-23"},
    {id:"3",label:"3ª Rodada",inicio:"2026-06-24",fim:"2026-06-28"},
  ];

  // Jogos filtrados pela rodada
  function diaBR(iso){return new Date(iso).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).split('/').reverse().join('-');}
  const filtradosRodada = jogos.filter(j=>{const r=RODADAS.find(x=>x.id===rodada);const d=diaBR(j.data_hora);return d>=r.inicio&&d<=r.fim;});

  // Dias disponíveis na rodada
  const todosOsDias = [...new Set(filtradosRodada.map(j=>diaBR(j.data_hora)))].sort();

  // Seleciona dia mais próximo ao entrar na rodada
  useEffect(()=>{
    if (todosOsDias.length===0){setDiaSel(null);return;}
    const hoje = diaBR(new Date().toISOString());
    const proximo = todosOsDias.find(d=>d>=hoje)||todosOsDias[todosOsDias.length-1];
    setDiaSel(proximo);
  },[rodada,jogos.length]); // eslint-disable-line

  // Centraliza o dia selecionado no calendário
  useEffect(()=>{
    if (!calRef.current||!diaSel) return;
    const btn = calRef.current.querySelector(`[data-dia="${diaSel}"]`);
    if (btn) btn.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  },[diaSel]);

  // *** FILTRO POR DIA — só mostra jogos do dia selecionado ***
  const jogosDoDia = filtradosRodada
    .filter(j=>diaBR(j.data_hora)===diaSel)
    .sort((a,b)=>new Date(a.data_hora)-new Date(b.data_hora));

  function formatDiaLabel(iso){
    const d = new Date(iso+"T12:00:00-03:00");
    return d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"long",day:"2-digit",month:"long"});
  }
  function formatHora(iso){
    return new Date(iso).toLocaleTimeString("pt-BR",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit"});
  }
  function formatCalDia(iso){
    const d = new Date(iso+"T12:00:00-03:00");
    return {
      sem: d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"short"}).replace(".","").toUpperCase().slice(0,3),
      num: String(d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",day:"2-digit"})).replace(/^0/,""),
      mes: d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",month:"short"}).replace(".","").toUpperCase().slice(0,3),
    };
  }

  return (
    <div style={{paddingTop:14}}>
      {/* Skeleton loader enquanto carrega */}
      {loading && (
        <div style={{padding:"0 14px"}}>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[80,90,80].map((w,i)=><div key={i} className="skeleton" style={{height:32,width:w,borderRadius:20}}/>)}
          </div>
          <div style={{display:"flex",gap:7,marginBottom:14}}>
            {[0,1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:72,width:54,borderRadius:12,flexShrink:0}}/>)}
          </div>
          {[0,1,2,3].map(i=>(
            <div key={i} className="skeleton" style={{height:130,borderRadius:14,marginBottom:10}}/>
          ))}
        </div>
      )}
      {!loading && <>
      {/* Filtro rodada */}
      <div style={{display:"flex",gap:6,padding:"0 14px 10px",flexWrap:"wrap",justifyContent:"center"}}>
        {RODADAS.map(r=>(
          <button key={r.id} className="pill btn" onClick={()=>setRodada(r.id)} style={{
            padding:"5px 14px",borderRadius:20,
            border:rodada===r.id?`1px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
            background:rodada===r.id
              ?`linear-gradient(135deg,${RED},#a30614)`
              :"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
            color:rodada===r.id?"#fff":MUTE,
            fontSize:12,fontWeight:rodada===r.id?600:500,
            fontFamily:FB,
            boxShadow:rodada===r.id
              ?"inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)"
              :"inset 0 1px 0 rgba(255,255,255,0.07),inset 0 -1px 0 rgba(0,0,0,0.1)",
          }}>{r.label}</button>
        ))}
      </div>

      {/* Calendário horizontal — FILTRO, não scroll */}
      {todosOsDias.length>0&&(
        <div ref={calRef} className="cal-scroll" style={{display:"flex",gap:7,padding:"0 14px 14px",justifyContent:"center"}}>
          {todosOsDias.map(dia=>{
            const {sem,num,mes} = formatCalDia(dia);
            const ativo = dia===diaSel;
            return (
              <button key={dia} data-dia={dia} className="btn" onClick={()=>setDiaSel(dia)} style={{
                flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",
                padding:"10px 14px",borderRadius:12,gap:2,minWidth:54,
                border:ativo?`1.5px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
                background: ativo
                  ?`linear-gradient(135deg,${RED},#a30614)`
                  :"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
                boxShadow: ativo
                  ?`0 4px 16px rgba(216,9,27,0.25),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)`
                  :"inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -1px 0 rgba(0,0,0,0.15)",
                cursor:"pointer",
                transition:"all 180ms var(--ease-out)",
              }}>
                <span style={{fontSize:9,fontWeight:700,color:ativo?"rgba(255,255,255,0.7)":DIM,letterSpacing:1}}>{sem}</span>
                <span style={{fontSize:26,fontWeight:400,color:"#fff",fontFamily:FD,lineHeight:1.05}}>{num}</span>
                <span style={{fontSize:9,fontWeight:600,color:ativo?"rgba(255,255,255,0.6)":DIM,letterSpacing:0.5}}>{mes}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Separador de data */}
      {diaSel&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"2px 14px 12px"}}>
          <div style={{flex:1,height:"0.5px",background:BORDER}}/>
          <span style={{fontSize:10,color:DIM,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap",letterSpacing:1}}>
            {formatDiaLabel(diaSel)}
          </span>
          <div style={{flex:1,height:"0.5px",background:BORDER}}/>
        </div>
      )}

      {/* Cards dos jogos do dia selecionado */}
      <div className="stagger" style={{padding:"0 14px 24px"}}>
        {jogosDoDia.length===0&&(
          <div style={{textAlign:"center",padding:"3rem 1rem"}}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{margin:"0 auto 16px",display:"block",opacity:0.2}}>
              <circle cx="24" cy="24" r="20" fill="none" stroke="#fff" strokeWidth="2"/>
              <path d="M16 24h16M24 16v16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{fontSize:13,color:DIM,fontFamily:FO,fontWeight:500}}>Nenhum jogo nesta data</div>
            <div style={{fontSize:11,color:"#333",marginTop:4}}>Selecione outro dia no calendário</div>
          </div>
        )}
        {jogosDoDia.map(j=>{
          const p      = palpites.find(x=>x.jogo_id===j.id);
          const passou = new Date(j.data_hora)<new Date();
          const pts    = p&&j.resultado_g1!=null ? calcPontos(p.g1,p.g2,j.resultado_g1,j.resultado_g2) : null;
          const isBR   = j.time1==="Brasil"||j.time2==="Brasil";
          return (
            <div key={j.id} className={"card card-glass"+(isBR?" card-brasil":"")} style={{
              borderRadius:14,padding:"14px",marginBottom:10,
              position:"relative",overflow:"hidden",
              border:isBR?"1px solid rgba(255,209,1,0.2)":`0.5px solid ${BORDER2}`,
              background:isBR?"linear-gradient(160deg,#161200,#0d0d0d)":"linear-gradient(160deg,#131313,#0c0c0c)",
              boxShadow:isBR?`0 4px 20px rgba(0,0,0,0.6),0 0 0 1px rgba(255,209,1,0.08),inset 0 1px 0 rgba(255,255,255,0.04)`:`${SH_MD},inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}>
              {/* Linha amarela topo para jogos do Brasil */}
              {isBR&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${YELLOW},transparent)`,opacity:0.6}}/>}

              {/* Header do card: grupo + hora + badge de pontos */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
                <div style={{
                  background:isBR?"rgba(255,209,1,0.08)":"rgba(255,255,255,0.04)",
                  color:isBR?YELLOW:DIM,
                  fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:5,letterSpacing:1,
                  border:isBR?"0.5px solid rgba(255,209,1,0.15)":"0.5px solid rgba(255,255,255,0.06)",
                }}>GRP {j.grupo} · {formatHora(j.data_hora)}</div>

                {pts!==null&&(
                  <span style={{
                    fontSize:9,borderRadius:6,padding:"3px 9px",fontWeight:700,letterSpacing:0.5,
                    background:pts===3?"rgba(255,209,1,0.12)":pts===1?"rgba(255,255,255,0.06)":"rgba(216,9,27,0.08)",
                    color:pts===3?YELLOW:pts===1?"#bbb":"#444",
                    border:pts===3?"0.5px solid rgba(255,209,1,0.25)":pts===1?"0.5px solid rgba(255,255,255,0.12)":"0.5px solid rgba(216,9,27,0.18)",
                  }}>{pts===3?"+3 EXATO":pts===1?"+1 VENCEDOR":"ERROU"}</span>
                )}
              </div>

              {/* Times + placar/palpite */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                {/* Time 1 */}
                <div style={{flex:1}}>
                  <Flag time={j.time1} size={42}/>
                  <div style={{fontWeight:600,fontSize:12,marginTop:6,color:isBR&&j.time1==="Brasil"?YELLOW:"#e0e0e0",letterSpacing:0.2}}>{j.time1}</div>
                </div>

                {/* Centro */}
                <div style={{textAlign:"center",flex:"0 0 auto"}}>
                  {passou||j.encerrado?(
                    <div>
                      {j.encerrado
                        ?<div className="score-box" style={{display:"inline-block",fontSize:26,fontWeight:400,color:"#fff",letterSpacing:4,fontFamily:FD}}>{j.resultado_g1} : {j.resultado_g2}</div>
                        :<div style={{fontSize:10,color:DIM,fontStyle:"italic"}}>Em andamento</div>
                      }
                      {p
                        ?<div style={{fontSize:10,color:DIM,marginTop:5,letterSpacing:0.4}}>Palpite {p.g1}—{p.g2}</div>
                        :<div style={{fontSize:10,color:"#252525",marginTop:5}}>Sem palpite</div>
                      }
                    </div>
                  ):(
                    <PalpiteInput jogoId={j.id} palpiteAtual={p} onSalvar={onSalvar} isBrasil={isBR}/>
                  )}
                </div>

                {/* Time 2 */}
                <div style={{flex:1,textAlign:"right"}}>
                  <div style={{display:"flex",justifyContent:"flex-end"}}><Flag time={j.time2} size={42}/></div>
                  <div style={{fontWeight:600,fontSize:12,marginTop:6,color:isBR&&j.time2==="Brasil"?YELLOW:"#e0e0e0",letterSpacing:0.2}}>{j.time2}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>
      }
    </div>
  );
}

/* ─── ADMIN CLIENTES ─────────────────────────────────────────────────────── */
function AdminClientes({ clientes, onAdd, onToggle }) {
  const [doc,setDoc]   = useState("");
  const [nome,setNome] = useState("");
  const [senha,setSenha]= useState("");
  const [tipo,setTipo] = useState("cliente");

  const inp = {
    width:"100%",boxSizing:"border-box",
    padding:"10px 12px",borderRadius:8,
    border:`0.5px solid ${BORDER2}`,fontSize:13,
    background:"#131313",color:"#e8e8e8",fontFamily:FB,
  };

  return (
    <div style={{padding:"14px"}}>
      {/* Form */}
      <div className="scale-in card glass" style={{borderRadius:13,padding:"1.2rem",marginBottom:14,position:"relative",overflow:"hidden",boxShadow:SH_MD}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${RED},transparent)`,opacity:0.45}}/>
        <div style={{fontSize:13,fontWeight:600,color:"#e0e0e0",marginBottom:12,letterSpacing:0.3}}>Novo cadastro</div>
        <div style={{display:"grid",gap:9}}>
          <input style={inp} placeholder="CPF ou CNPJ (só números)" value={doc} onChange={e=>setDoc(e.target.value)}/>
          <input style={inp} placeholder="Nome / Razão social" value={nome} onChange={e=>setNome(e.target.value)}/>
          <input style={inp} placeholder="Senha inicial" value={senha} onChange={e=>setSenha(e.target.value)}/>
          <select style={{...inp,cursor:"pointer"}} value={tipo} onChange={e=>setTipo(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="funcionario">Funcionário</option>
          </select>
          <button className="btn" style={{border:"none",borderRadius:8,padding:"12px",fontSize:12,background:`linear-gradient(135deg,${RED},#a30614)`,color:"#fff",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",boxShadow:"0 4px 16px rgba(216,9,27,0.3)"}}
            onClick={async()=>{await onAdd(doc,nome,senha,tipo);setDoc("");setNome("");setSenha("");setTipo("cliente");}}>
            Adicionar
          </button>
        </div>
      </div>

      <div style={{fontSize:9,color:DIM,marginBottom:10,letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>
        {clientes.filter(c=>c.doc!=="admin"&&c.ativo).length} cadastros ativos
      </div>

      <div className="stagger">
        {clientes.filter(c=>c.doc!=="admin").map(c=>(
          <div key={c.id} className="card" style={{borderRadius:11,padding:"12px 15px",marginBottom:7,display:"flex",alignItems:"center",gap:11,opacity:c.ativo?1:0.35,boxShadow:SH_SM}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:500,fontSize:13,color:"#e0e0e0"}}>{c.nome}</div>
              <div style={{fontSize:10,color:DIM,marginTop:3,display:"flex",alignItems:"center",gap:7}}>
                <span>{c.doc}</span>
                <span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
                  color:c.tipo==="funcionario"?"#60a5fa":YELLOW,
                  background:c.tipo==="funcionario"?"rgba(96,165,250,0.08)":"rgba(255,209,1,0.08)",
                  padding:"2px 6px",borderRadius:4,
                  border:`0.5px solid ${c.tipo==="funcionario"?"rgba(96,165,250,0.2)":"rgba(255,209,1,0.2)"}`,
                }}>{c.tipo==="funcionario"?"FUNC":"CLI"}</span>
              </div>
            </div>
            <button className="btn" style={{border:`0.5px solid ${BORDER2}`,borderRadius:6,padding:"5px 12px",fontSize:11,background:"transparent",color:MUTE,fontWeight:500}}
              onClick={()=>onToggle(c.id,c.ativo)}>{c.ativo?"Desativar":"Ativar"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ADMIN RESULTADOS ───────────────────────────────────────────────────── */
function AdminResultados({ jogos, onSalvar }) {
  function formatData(iso){
    const d=new Date(iso);
    return d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"})+" · "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  }
  return (
    <div className="stagger" style={{padding:"14px"}}>
      {jogos.map(j=>(
        <div key={j.id} className="card" style={{borderRadius:13,padding:"13px 14px",marginBottom:8,boxShadow:SH_SM}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:9,color:DIM,textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>Grupo {j.grupo}</span>
            <span style={{fontSize:9,color:DIM}}>{formatData(j.data_hora)}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontWeight:500,flex:1,display:"flex",alignItems:"center",gap:7,color:"#e0e0e0",fontSize:12}}><Flag time={j.time1} size={20}/>{j.time1}</span>
            <ResultInput jogo={j} onSalvar={onSalvar}/>
            <span style={{fontWeight:500,flex:1,textAlign:"right",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:7,color:"#e0e0e0",fontSize:12}}>{j.time2}<Flag time={j.time2} size={20}/></span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── RESULT INPUT ───────────────────────────────────────────────────────── */
function ResultInput({ jogo, onSalvar }) {
  const [g1,setG1]=useState(jogo.resultado_g1!=null?jogo.resultado_g1:"");
  const [g2,setG2]=useState(jogo.resultado_g2!=null?jogo.resultado_g2:"");
  const num={width:42,textAlign:"center",padding:"6px 2px",borderRadius:6,border:`0.5px solid ${BORDER2}`,fontSize:15,fontWeight:600,background:"#131313",color:"#fff",fontFamily:FD};
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <input style={num} type="number" min={0} max={20} value={g1} onChange={e=>setG1(e.target.value)}/>
        <span style={{color:"#2a2a2a",fontSize:12}}>×</span>
        <input style={num} type="number" min={0} max={20} value={g2} onChange={e=>setG2(e.target.value)}/>
      </div>
      <button className="btn" style={{border:"none",borderRadius:6,padding:"4px 12px",fontSize:9,background:RED,color:"#fff",fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}
        onClick={()=>onSalvar(jogo.id,g1,g2)}>
        {jogo.encerrado?"Atualizar":"Salvar"}
      </button>
      {jogo.encerrado&&<span style={{fontSize:9,color:"#4ade80",letterSpacing:0.4}}>{jogo.resultado_g1}—{jogo.resultado_g2}</span>}
    </div>
  );
}

/* ─── PALPITE INPUT ──────────────────────────────────────────────────────── */
function PalpiteInput({ jogoId, palpiteAtual, onSalvar, isBrasil }) {
  const [g1,setG1]=useState(palpiteAtual?palpiteAtual.g1:"");
  const [g2,setG2]=useState(palpiteAtual?palpiteAtual.g2:"");
  const pronto = g1!==""&&g2!=="";
  const num={
    width:50,textAlign:"center",padding:"9px 2px",borderRadius:8,
    border:`1px solid ${isBrasil?"rgba(255,209,1,0.35)":BORDER2}`,
    fontSize:22,fontWeight:400,
    background:"linear-gradient(160deg,#1a1a1a,#111)",
    color:"#fff",fontFamily:FD,
    boxShadow:"inset 0 2px 6px rgba(0,0,0,0.5)",
  };
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <input style={num} type="number" min={0} max={20} value={g1} onChange={e=>setG1(e.target.value)}/>
        <span style={{color:"#252525",fontSize:14}}>×</span>
        <input style={num} type="number" min={0} max={20} value={g2} onChange={e=>setG2(e.target.value)}/>
      </div>
      <button className="btn" style={{
        border:"none",borderRadius:20,padding:"6px 18px",
        fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",
        background:palpiteAtual?`linear-gradient(135deg,#5a020e,#3a0008)`:`linear-gradient(135deg,${RED},#a30614)`,
        color:"#fff",
        boxShadow:pronto?`0 3px 12px rgba(216,9,27,0.4)`:undefined,
        opacity:pronto?1:0.4,
        cursor:pronto?"pointer":"not-allowed",
      }} onClick={()=>onSalvar(jogoId,g1,g2)} disabled={!pronto}>
        {palpiteAtual?"Atualizar":"Salvar"}
      </button>
    </div>
  );
}
