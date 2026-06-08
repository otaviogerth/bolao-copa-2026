"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const RED    = "#D8091B";
const YELLOW = "#FFD101";
const DARK   = "#111318";
const CARD   = "#181c24";
const BORDER = "#252a36";
const BORDER2= "#2e3444";
const DIM    = "#6b7280";
const MUTE   = "#8b95a8";
const SUPA   = "https://gdkvezigujpaqqavablu.supabase.co/storage/v1/object/public/assets";
const LOGO_BRANCA   = SUPA + "/bet%20lube%20branca.png";
const LOGO_VERMELHA = "/bet lube vermelha.png";

const FD = "'FIFATournament','Impact',sans-serif";
const FB = "'Ubuntu',sans-serif";

const SH_SM = "0 1px 3px rgba(0,0,0,0.5),0 1px 2px rgba(0,0,0,0.4)";
const SH_MD = "0 4px 16px rgba(0,0,0,0.6),0 1px 4px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.03)";
const SH_LG = "0 8px 40px rgba(0,0,0,0.75),0 2px 8px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)";

const TIMES_COPA = [
  {nome:"África do Sul"},
  {nome:"Alemanha"},
  {nome:"Arábia Saudita"},
  {nome:"Argélia"},
  {nome:"Argentina"},
  {nome:"Austrália"},
  {nome:"Áustria"},
  {nome:"Bélgica"},
  {nome:"Bósnia"},
  {nome:"Brasil"},
  {nome:"Cabo Verde"},
  {nome:"Canadá"},
  {nome:"Colômbia"},
  {nome:"Coreia do Sul"},
  {nome:"Costa do Marfim"},
  {nome:"Croácia"},
  {nome:"Curaçao"},
  {nome:"Egito"},
  {nome:"Equador"},
  {nome:"Escócia"},
  {nome:"Espanha"},
  {nome:"Estados Unidos"},
  {nome:"França"},
  {nome:"Gana"},
  {nome:"Haiti"},
  {nome:"Holanda"},
  {nome:"Inglaterra"},
  {nome:"Irã"},
  {nome:"Iraque"},
  {nome:"Japão"},
  {nome:"Jordânia"},
  {nome:"Marrocos"},
  {nome:"México"},
  {nome:"Nova Zelândia"},
  {nome:"Noruega"},
  {nome:"Panamá"},
  {nome:"Paraguai"},
  {nome:"Portugal"},
  {nome:"Qatar"},
  {nome:"RD Congo"},
  {nome:"Rep. Tcheca"},
  {nome:"Senegal"},
  {nome:"Suécia"},
  {nome:"Suíça"},
  {nome:"Tunísia"},
  {nome:"Turquia"},
  {nome:"Uruguai"},
  {nome:"Uzbequistão"},
];

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

function calcPontos(g1, g2, rg1, rg2, isBrasil = false) {
  if (rg1 == null || rg2 == null) return null;
  const mult = isBrasil ? 2 : 1;
  if (g1 === rg1 && g2 === rg2) return 10 * mult;
  const v = (a, b) => a > b ? 1 : b > a ? 2 : 0;
  return v(g1, g2) === v(rg1, rg2) ? 5 * mult : 0;
}

function isHorarioComercialBrasilia(iso) {
  // Brasil e permanentemente UTC-3 desde 2019
  const d = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000);
  const dow = d.getUTCDay(); // 0=Dom, 6=Sab
  const h = d.getUTCHours();
  return dow >= 1 && dow <= 5 && h >= 8 && h < 18;
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

      @keyframes fadeUp   {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      @keyframes scaleIn  {from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
      @keyframes shimmer  {0%{background-position:-200% 0}100%{background-position:200% 0}}

      :root{
        --ease-out:cubic-bezier(0.16,1,0.3,1);
        --ease-in-out:cubic-bezier(0.77,0,0.175,1);
      }

      .fade-up  {animation:fadeUp  0.35s var(--ease-out) both;}
      .scale-in {animation:scaleIn 0.3s  var(--ease-out) both;}

      .stagger>*{animation:fadeUp 0.35s var(--ease-out) both;}
      .stagger>*:nth-child(1){animation-delay:30ms}
      .stagger>*:nth-child(2){animation-delay:60ms}
      .stagger>*:nth-child(3){animation-delay:90ms}
      .stagger>*:nth-child(4){animation-delay:120ms}
      .stagger>*:nth-child(5){animation-delay:120ms}
      .stagger>*:nth-child(6){animation-delay:144ms}
      .stagger>*:nth-child(7){animation-delay:168ms}
      .stagger>*:nth-child(n+8){animation-delay:190ms}

      .screen{animation:fadeUp 0.3s var(--ease-out) both;}

      .card{
        background:linear-gradient(160deg,#1c2030 0%,#161a26 100%);
        border:0.5px solid ${BORDER2};
        transition:
          transform 200ms var(--ease-out),
          box-shadow 200ms var(--ease-out),
          border-color 200ms ease;
      }
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

      .btn{
        transition:transform 160ms var(--ease-out),filter 160ms ease,box-shadow 160ms ease;
        cursor:pointer;
      }
      .btn:active{transform:scale(0.97);filter:brightness(0.92);}
      @media(hover:hover)and(pointer:fine){
        .btn:hover{transform:translateY(-1px);filter:brightness(1.1);}
      }

      .pill{
        transition:background 160ms ease,border-color 160ms ease,color 160ms ease,transform 160ms cubic-bezier(0.16,1,0.3,1);
        cursor:pointer;
      }

      input[type="number"]::-webkit-inner-spin-button,
      input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
      input[type="number"]{-moz-appearance:textfield;}
      input:focus,button:focus{outline:none;}
      input{transition:border-color 180ms ease,box-shadow 180ms ease;font-family:${FB};}
      input:focus{border-color:${RED}!important;box-shadow:0 0 0 3px rgba(216,9,27,0.14)!important;}
      ::selection{background:${RED};color:#fff;}

      .skeleton{
        background:linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);
        background-size:200% 100%;
        animation:shimmer 1.4s ease infinite;
        border-radius:8px;
      }

      @media(prefers-reduced-motion:reduce){
        *{animation:none!important;}
        *{transition:opacity 150ms ease,color 150ms ease!important;}
      }

      .cal-scroll{overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
      .cal-scroll::-webkit-scrollbar{display:none;}
      .team-list{overflow-y:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
      .team-list::-webkit-scrollbar{display:none;}

      .nav-bar{
        border-bottom:1px solid transparent;
        background:
          linear-gradient(${DARK},${DARK}) padding-box,
          linear-gradient(90deg,transparent 0%,${RED} 40%,${RED} 60%,transparent 100%) border-box;
      }

      .score-box{
        background:linear-gradient(160deg,#181818,#101010);
        border-radius:8px;
        box-shadow:inset 0 2px 6px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.03);
        padding:5px 10px;min-width:50px;text-align:center;
      }

      .glass{
        border:0.5px solid rgba(255,255,255,0.07);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.07),inset 0 -1px 0 rgba(0,0,0,0.2),0 1px 3px rgba(0,0,0,0.4);
      }
      .card-glass{
        background:linear-gradient(160deg,rgba(28,32,42,0.97) 0%,rgba(20,24,34,0.99) 100%);
        border:0.5px solid rgba(255,255,255,0.08);
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -1px 0 rgba(0,0,0,0.2),0 4px 16px rgba(0,0,0,0.35);
      }

      /* Stepper btn — sem o hover genérico do .btn para não brigar */
      .stepper-btn{
        transition:opacity 160ms ease,border-color 160ms ease,background 160ms ease,transform 160ms var(--ease-out);
        cursor:pointer;
        border:none;
        padding:0;
        display:flex;align-items:center;justify-content:center;
      }
      .stepper-btn:active{transform:scale(0.93);}
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

/* ─── UTILITÁRIOS DE DATA ────────────────────────────────────────────────── */
function diaBR(iso){return new Date(iso).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).split('/').reverse().join('-');}
function formatDiaLabel(iso){const d=new Date(iso+"T12:00:00-03:00");return d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"long",day:"2-digit",month:"long"});}
function formatHora(iso){return new Date(iso).toLocaleTimeString("pt-BR",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit"});}
function formatCalDia(iso){const d=new Date(iso+"T12:00:00-03:00");return {sem:d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"short"}).replace(".","").toUpperCase().slice(0,3),num:String(d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",day:"2-digit"})).replace(/^0/,""),mes:d.toLocaleDateString("pt-BR",{timeZone:"America/Sao_Paulo",month:"short"}).replace(".","").toUpperCase().slice(0,3)};}

/* ─── LISTA MATA-MATA (usuário) ─────────────────────────────────────────── */
function ListaMataMata({ jogos, palpites, onSalvar, onDeletar }) {
  const [faseSel,setFaseSel] = useState("16avos");
  const [diaSel,setDiaSel]   = useState(null);
  const calRef = useRef(null);

  const FASES = [
    {id:"16avos",  label:"Rodada de 32"},
    {id:"oitavas", label:"Oitavas"},
    {id:"quartas", label:"Quartas"},
    {id:"semis",    label:"Semis"},
    {id:"terceiro", label:"3º Lugar"},
    {id:"final",    label:"Final"},
  ];

  const jogosFase    = jogos.filter(j=>j.fase===faseSel);
  const jogosComData = jogosFase.filter(j=>j.data_hora);
  const jogosSemData = jogosFase.filter(j=>!j.data_hora);
  const todosOsDias  = [...new Set(jogosComData.map(j=>diaBR(j.data_hora)))].sort();

  useEffect(()=>{
    if(todosOsDias.length===0){setDiaSel(null);return;}
    const hoje=diaBR(new Date().toISOString());
    const proximo=todosOsDias.find(d=>d>=hoje)||todosOsDias[todosOsDias.length-1];
    setDiaSel(proximo);
  },[faseSel,jogos.length]); // eslint-disable-line

  useEffect(()=>{
    if(!calRef.current||!diaSel)return;
    const btn=calRef.current.querySelector(`[data-dia="${diaSel}"]`);
    if(btn)btn.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  },[diaSel]);

  const jogosDoDia = jogosComData
    .filter(j=>diaBR(j.data_hora)===diaSel)
    .sort((a,b)=>new Date(a.data_hora)-new Date(b.data_hora));

  function renderCard(j){
    const p=palpites.find(x=>x.jogo_id===j.id);
    const isBR=j.time1==="Brasil"||j.time2==="Brasil";
    const ptMax=isBR?20:10;
    const ptMid=isBR?10:5;
    const pts=p&&j.resultado_g1!=null?calcPontos(p.g1,p.g2,j.resultado_g1,j.resultado_g2,isBR):null;
    const time1=j.time1||"A definir";
    const time2=j.time2||"A definir";
    const definido=!!(j.time1&&j.time2);
    return (
      <div key={j.id} className="card" style={{
        borderRadius:14,padding:"14px",marginBottom:10,
        minHeight:176,
        position:"relative",overflow:"hidden",
        border:`0.5px solid ${BORDER2}`,
        background:"linear-gradient(160deg,#131313,#0c0c0c)",
        boxShadow:`${SH_MD},inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
          <div style={{background:"rgba(255,255,255,0.04)",color:DIM,fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:5,letterSpacing:1,border:"0.5px solid rgba(255,255,255,0.06)"}}>
            {j.data_hora?formatHora(j.data_hora):"A definir"}
          </div>
          {pts!==null&&(
            <span style={{fontSize:9,borderRadius:6,padding:"3px 9px",fontWeight:700,letterSpacing:0.5,background:pts===ptMax?"rgba(255,209,1,0.12)":pts===ptMid?"rgba(255,255,255,0.06)":"rgba(216,9,27,0.08)",color:pts===ptMax?YELLOW:pts===ptMid?"#bbb":"#444",border:pts===ptMax?"0.5px solid rgba(255,209,1,0.25)":pts===ptMid?"0.5px solid rgba(255,255,255,0.12)":"0.5px solid rgba(216,9,27,0.18)"}}>{pts===ptMax?`+${ptMax} EXATO`:pts===ptMid?`+${ptMid} VENCEDOR`:"ERROU"}</span>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
          <div style={{flex:1}}>
            {j.time1&&<Flag time={j.time1} size={52}/>}
            <div style={{fontWeight:600,fontSize:12,marginTop:6,color:j.time1?"#e0e0e0":DIM,letterSpacing:0.2,fontStyle:j.time1?"normal":"italic"}}>{time1}</div>
          </div>
          <div style={{textAlign:"center",flex:"0 0 auto"}}>
            {j.encerrado?(
              <div>
                <div className="score-box" style={{display:"inline-block",fontSize:26,fontWeight:400,color:"#fff",letterSpacing:4,fontFamily:FD}}>{j.resultado_g1} : {j.resultado_g2}</div>
                {p&&<div style={{fontSize:10,color:DIM,marginTop:5,letterSpacing:0.4}}>Palpite {p.g1}—{p.g2}</div>}
              </div>
            ):new Date(j.data_hora)<=new Date()?(
              <div style={{fontSize:10,color:DIM,fontStyle:"italic"}}>Em andamento</div>
            ):definido?(
              <PalpiteInput key={p?.id??`empty-${j.id}`} jogoId={j.id} palpiteAtual={p} onSalvar={onSalvar} onDeletar={()=>onDeletar(p?.id)} isBrasil={false}/>
            ):(
              <div style={{fontSize:11,color:DIM,fontStyle:"italic",padding:"0 8px"}}>—</div>
            )}
          </div>
          <div style={{flex:1,textAlign:"right"}}>
            {j.time2&&<div style={{display:"flex",justifyContent:"flex-end"}}><Flag time={j.time2} size={52}/></div>}
            <div style={{fontWeight:600,fontSize:12,marginTop:6,color:j.time2?"#e0e0e0":DIM,letterSpacing:0.2,fontStyle:j.time2?"normal":"italic"}}>{time2}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingTop:14}}>
      <div style={{display:"flex",gap:6,padding:"0 14px 10px",flexWrap:"wrap",justifyContent:"center"}}>
        {FASES.map(f=>(
          <button key={f.id} className="pill btn" onClick={()=>setFaseSel(f.id)} style={{
            padding:"5px 14px",borderRadius:20,
            border:faseSel===f.id?`1px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
            background:faseSel===f.id?`linear-gradient(135deg,${RED},#a30614)`:"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
            color:faseSel===f.id?"#fff":MUTE,
            fontSize:12,fontWeight:faseSel===f.id?600:500,
            fontFamily:FB,
            boxShadow:faseSel===f.id?"inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)":"inset 0 1px 0 rgba(255,255,255,0.07),inset 0 -1px 0 rgba(0,0,0,0.1)",
          }}>{f.label}</button>
        ))}
      </div>

      {todosOsDias.length>0&&(
        <div ref={calRef} className="cal-scroll" style={{display:"flex",gap:7,padding:"0 14px 14px",justifyContent:"center"}}>
          {todosOsDias.map(dia=>{
            const {sem,num,mes}=formatCalDia(dia);
            const ativo=dia===diaSel;
            return (
              <button key={dia} data-dia={dia} className="btn" onClick={()=>setDiaSel(dia)} style={{
                flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",
                padding:"10px 14px",borderRadius:12,gap:2,minWidth:54,
                border:ativo?`1.5px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
                background:ativo?`linear-gradient(135deg,${RED},#a30614)`:"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
                boxShadow:ativo?`0 4px 16px rgba(216,9,27,0.25),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)`:"inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -1px 0 rgba(0,0,0,0.15)",
                cursor:"pointer",transition:"all 180ms var(--ease-out)",
              }}>
                <span style={{fontSize:9,fontWeight:700,color:ativo?"rgba(255,255,255,0.7)":DIM,letterSpacing:1}}>{sem}</span>
                <span style={{fontSize:26,fontWeight:400,color:"#fff",fontFamily:FD,lineHeight:1.05}}>{num}</span>
                <span style={{fontSize:9,fontWeight:600,color:ativo?"rgba(255,255,255,0.6)":DIM,letterSpacing:0.5}}>{mes}</span>
              </button>
            );
          })}
        </div>
      )}

      {diaSel&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"2px 14px 12px"}}>
          <div style={{flex:1,height:"0.5px",background:BORDER}}/>
          <span style={{fontSize:10,color:DIM,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap",letterSpacing:1}}>
            {formatDiaLabel(diaSel)}
          </span>
          <div style={{flex:1,height:"0.5px",background:BORDER}}/>
        </div>
      )}

      <div className="stagger" style={{padding:"0 14px 24px"}}>
        {jogosDoDia.length===0&&jogosSemData.length===0&&(
          <div style={{textAlign:"center",padding:"3rem 1rem"}}>
            <div style={{fontSize:13,color:DIM,fontFamily:FD,fontWeight:500}}>Nenhum jogo nesta fase</div>
          </div>
        )}
        {jogosDoDia.map(j=>renderCard(j))}
      </div>

      {jogosSemData.length>0&&(
        <div style={{padding:"0 14px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"2px 0 12px"}}>
            <div style={{flex:1,height:"0.5px",background:BORDER}}/>
            <span style={{fontSize:10,color:DIM,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap",letterSpacing:1}}>A DEFINIR</span>
            <div style={{flex:1,height:"0.5px",background:BORDER}}/>
          </div>
          <div className="stagger">
            {jogosSemData.map(j=>renderCard(j))}
          </div>
        </div>
      )}
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
  const [palpites,setPalpites]           = useState([]);
  const [todosPalpites,setTodosPalpites] = useState([]);
  const [clientes,setClientes]           = useState([]);
  const [msg,setMsg]           = useState(null);
  const [competicao,setCompeticao] = useState("funcionario");
  const [horarioComercial,setHorarioComercial] = useState(false);
  const [liberadoManual,setLiberadoManual]     = useState(false);

  const isAdmin  = user?.doc === "admin";
  const bloqueado = horarioComercial && !liberadoManual;

  useEffect(()=>{
    if (tela==="campeao" && user?.palpite_campeao) setTela("jogos");
  },[tela,user]);

  useEffect(()=>{
    async function checkTime() {
      try {
        const r = await fetch("/api/time");
        const { iso } = await r.json();
        setHorarioComercial(isHorarioComercialBrasilia(iso));
      } catch {}
      try {
        const { data } = await supabase.from("configuracoes").select("liberado_manual").eq("id",1).single();
        if (data) setLiberadoManual(data.liberado_manual);
      } catch {}
    }
    checkTime();
    const id = setInterval(checkTime, 60000);
    return () => clearInterval(id);
  },[]);

  useEffect(()=>{
    if (!bloqueado || !user || user.doc === "admin") return;
    if (["jogos","matamata","campeao"].includes(tela)) setTela("ranking");
  },[bloqueado, user]); // eslint-disable-line

  async function login(doc, senha) {
    setLoading(true); setLoginErr("");
    const docStr = doc.trim();
    const docNumerico = docStr.replace(/\D/g,"");
    const docLimpo = /^\d+$/.test(docNumerico) && docNumerico === docStr.replace(/[.\-\/]/g,"") ? docNumerico : docStr;
    let q = supabase.from("clientes").select("*").eq("doc",docLimpo).eq("senha",senha).eq("ativo",true);
    if (docLimpo.toLowerCase() !== "admin") q = q.eq("tipo", competicao);
    const { data, error } = await q.limit(1);
    if (error || !data.length) {
      setLoginErr("CPF/CNPJ ou senha incorretos.");
      setLoading(false); return;
    }
    const u = data[0];
    setUser(u);
    if (u.doc === "admin") { await Promise.all([carregarJogos(),carregarClientes()]); setTela("admin"); }
    else { await Promise.all([carregarJogos(),carregarPalpites(u.id),carregarClientes(),carregarTodosPalpites()]); setTela("boasvindas"); }
    setLoading(false);
  }

  async function carregarJogos()         { const {data}=await supabase.from("jogos").select("*").order("data_hora"); setJogos(data||[]); }
  async function carregarPalpites(id)    { const {data}=await supabase.from("palpites").select("*").eq("cliente_id",id); setPalpites(data||[]); }
  async function carregarClientes()      { const {data}=await supabase.from("clientes").select("*").order("nome"); setClientes(data||[]); }
  async function carregarTodosPalpites() { const {data}=await supabase.from("palpites").select("*"); setTodosPalpites(data||[]); }
  function logout()                      { setUser(null);setTela("login");setJogos([]);setPalpites([]);setTodosPalpites([]);setClientes([]); }
  function flash(text,err)               { setMsg({text,err});setTimeout(()=>setMsg(null),2500); }

  async function salvarPalpite(jogoId,g1,g2) {
    const jogo = jogos.find(j=>j.id===jogoId);
    if (jogo && new Date(jogo.data_hora) <= new Date()) { flash("Jogo já começou — aposta bloqueada",true); return; }
    const exist = palpites.find(p=>p.jogo_id===jogoId&&p.cliente_id===user.id);
    if (exist) await supabase.from("palpites").update({g1:parseInt(g1),g2:parseInt(g2)}).eq("id",exist.id);
    else       await supabase.from("palpites").insert({cliente_id:user.id,jogo_id:jogoId,g1:parseInt(g1),g2:parseInt(g2)});
    await carregarPalpites(user.id);
    flash("Palpite salvo");
  }

  async function deletarPalpite(palpiteId) {
    if (!palpiteId) return;
    setPalpites(prev=>prev.filter(p=>p.id!==palpiteId));
    setTodosPalpites(prev=>prev.filter(p=>p.id!==palpiteId));
    await supabase.from("palpites").delete().eq("id", palpiteId);
    await carregarPalpites(user.id);
    flash("Palpite removido");
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

  async function toggleLiberadoManual(novoValor) {
    try {
      await supabase.from("configuracoes").update({ liberado_manual: novoValor }).eq("id", 1);
      setLiberadoManual(novoValor);
    } catch {}
  }

  async function zerarResultados() {
    if (!confirm("Zerar TODOS os resultados? Os palpites serão mantidos.")) return;
    await Promise.all([
      supabase.from("jogos").update({resultado_g1:null,resultado_g2:null,encerrado:false}).eq("encerrado",true),
      supabase.from("jogos").update({resultado_g1:null,resultado_g2:null,encerrado:false}).not("resultado_g1","is",null),
      supabase.from("jogos").update({resultado_g1:null,resultado_g2:null,encerrado:false}).not("resultado_g2","is",null),
    ]);
    await carregarJogos();
    flash("Todos os resultados foram zerados");
  }

  const ranking = useMemo(()=>{
    return clientes.filter(c=>c.doc!=="admin" && c.tipo==="funcionario").map(c=>{
      let pts=0,acertos=0,acertosBrasil=0,acertosExatoVencedor=0;
      jogos.forEach(j=>{
        const p=todosPalpites.find(x=>x.cliente_id===c.id&&x.jogo_id===j.id);
        if (!p||j.resultado_g1==null) return;
        const isBrasil=j.time1==="Brasil"||j.time2==="Brasil";
        const pp=calcPontos(p.g1,p.g2,j.resultado_g1,j.resultado_g2,isBrasil);
        pts+=pp;
        const isExact = p.g1===j.resultado_g1 && p.g2===j.resultado_g2;
        if(isExact) acertos++;
        if(isExact && isBrasil) acertosBrasil++;
        if(isExact && j.resultado_g1!==j.resultado_g2) acertosExatoVencedor++;
      });
      return {...c,pts,acertos,acertosBrasil,acertosExatoVencedor};
    }).sort((a,b)=>
      b.pts-a.pts ||
      b.acertosBrasil-a.acertosBrasil ||
      b.acertosExatoVencedor-a.acertosExatoVencedor ||
      a.id-b.id
    );
  },[clientes,jogos,todosPalpites]);

  const rankingDoMeuTipo = user ? ranking.filter(r=>r.tipo===user.tipo) : ranking;
  const meuRank = user ? rankingDoMeuTipo.findIndex(r=>r.id===user.id)+1 : 0;
  const meusPts = user ? (ranking.find(r=>r.id===user.id)||{}).pts||0 : 0;

  /* ── LOGIN ── */
  if (tela==="login") return (
    <>
      <GlobalStyles/>
      <div style={{fontFamily:FB,background:"#f8f7f5",minHeight:"100dvh",display:"flex",flexDirection:"column"}}>
        <div className="fade-up"><Banner/></div>
        <div style={{flex:1,padding:"2rem 1.5rem 1rem",maxWidth:440,width:"100%",margin:"0 auto"}}>
          <div className="fade-up" style={{fontFamily:FD,fontSize:52,fontWeight:800,color:"#111",letterSpacing:-1,lineHeight:1,marginBottom:4}}>LOGIN</div>
          <div className="fade-up" style={{fontSize:12,color:MUTE,marginBottom:"1.75rem",animationDelay:"40ms",letterSpacing:0.3}}>
            Bolao exclusivo para funcionarios
          </div>
          <div className="fade-up" style={{marginBottom:"1.25rem",animationDelay:"100ms"}}>
            <div style={{fontSize:10,color:"#999",marginBottom:8,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>CPF ou CNPJ</div>
            <input id="doc" name="username" autoComplete="username" style={{width:"100%",border:"none",borderBottom:"1.5px solid #ddd",outline:"none",fontSize:16,padding:"10px 0",background:"transparent",color:"#111",fontWeight:500}}/>
          </div>
          <div className="fade-up" style={{marginBottom:"2rem",animationDelay:"130ms"}}>
            <div style={{fontSize:10,color:"#999",marginBottom:8,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Senha</div>
            <input id="senha" name="password" type="password" autoComplete="current-password" style={{width:"100%",border:"none",borderBottom:"1.5px solid #ddd",outline:"none",fontSize:16,padding:"10px 0",background:"transparent",color:"#111",fontWeight:500}}
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
            color:"#fff",borderRadius:6,animationDelay:"160ms",
            boxShadow:"0 4px 20px rgba(216,9,27,0.35)",
            opacity: loading ? 0.6 : 1,
          }} onClick={()=>login(document.getElementById("doc").value,document.getElementById("senha").value)} disabled={loading}>
            {loading?"ENTRANDO...":"ENTRAR"}
          </button>
        </div>
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
      {visual:<VisualPontos/>,titulo:"Como pontuar",texto:"Acertou o placar exato (ex: 2×1)? 10 pontos. Acertou só quem ganhou ou que empatou? 5 pontos. Errou? 0 pontos. Nos jogos do Brasil, a pontuação é dobrada — 20pts pelo exato, 10pts pelo vencedor."},
      {visual:<Visual3/>,titulo:"Premios",texto:"1º lugar: R$ 500,00  |  2º lugar: R$ 300,00  |  3º lugar: R$ 200,00. Quem acertar o campeao da Copa ganha R$ 500,00, dividido entre os acertadores."},
      {visual:<Visual4/>,titulo:"Cuidado",texto:"Os palpites fecham automaticamente no apito inicial de cada jogo. Sem exceções. Não deixe para a última hora — cada jogo é uma chance."},
      {visual:<Visual5/>,titulo:"Tudo pronto",texto:"Você está pronto para jogar. Boa sorte — que vençam os melhores palpites.",subtexto:"Seus dados são usados exclusivamente para este bolão."},
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
            <Carrossel slides={slides} onFim={()=>setTela(bloqueado?"ranking":user.palpite_campeao?"jogos":"campeao")}/>
          </div>
        </div>
      </>
    );
  }

  /* ── CAMPEÃO ── */
  if (tela==="campeao") {
    return (
      <>
        <GlobalStyles/>
        <div style={{position:"relative",fontFamily:FB,minHeight:"100vh",overflow:"hidden",background:DARK}}>
          <div style={{pointerEvents:"none",userSelect:"none",opacity:0.15,filter:"blur(3px)"}}>
            <Banner/>
          </div>
          <div className="fade-up" style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",background:"rgba(0,0,0,0.88)",backdropFilter:"blur(6px)"}}>
            <TelaCampeao
              user={user}
              onConfirmar={(nome)=>{setUser(prev=>({...prev,palpite_campeao:nome}));setTela("jogos");}}
            />
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
        {bloqueado && user.doc !== "admin" && (
          <div style={{
            position:"sticky",top:0,zIndex:100,
            background:"#1a1500",borderBottom:`0.5px solid rgba(255,209,1,0.25)`,
            padding:"10px 16px",textAlign:"center",
            color:YELLOW,fontFamily:FB,fontSize:12,fontWeight:600,letterSpacing:0.3,
          }}>
            Periodo de trabalho (seg-sex 8h-18h). Apenas o ranking esta disponivel agora.
          </div>
        )}
        <div className="nav-bar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",background:DARK}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src={LOGO_VERMELHA} alt="Bet Lube" style={{height:120,width:"auto",objectFit:"contain"}}/>
            <div style={{width:1,height:16,background:BORDER2}}/>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#e8e8e8",lineHeight:1.2}}>{isAdmin?"Admin":user.nome}</div>
              {!isAdmin&&<div style={{fontSize:10,color:DIM,marginTop:1}}>{formatDoc(user.doc)}</div>}
            </div>
          </div>
          <button className="btn" style={{border:`0.5px solid ${BORDER2}`,borderRadius:6,padding:"5px 13px",fontSize:11,background:"rgba(255,255,255,0.03)",color:MUTE,fontWeight:500}} onClick={logout}>Sair</button>
        </div>

        {msg&&(
          <div className="fade-up" style={{margin:"10px 14px 0",padding:"10px 14px",borderRadius:8,background:msg.err?"#160202":"#021208",color:msg.err?"#ff6060":"#4ade80",fontSize:12,border:`0.5px solid ${msg.err?"rgba(216,9,27,0.3)":"rgba(74,222,128,0.2)"}`,fontWeight:600}}>
            {msg.text}
          </div>
        )}

        {!isAdmin&&(
          <div className="stagger" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"12px 14px 0"}}>
            {[
              {label:"Seus pontos",val:meusPts,cor:YELLOW,bg:"linear-gradient(135deg,rgba(255,209,1,0.08),rgba(28,32,42,0.95))",topBar:`linear-gradient(90deg,transparent,${YELLOW},transparent)`,labelFont:FB},
              {label:"Posição",val:meuRank>0?meuRank+"º":"—",cor:"#e8e8e8",bg:"linear-gradient(135deg,rgba(216,9,27,0.06),rgba(28,32,42,0.95))",topBar:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",labelFont:FB},
            ].map(({label,val,cor,bg,topBar,labelFont})=>(
              <div key={label} className="card card-glass" onClick={label==="Posição"?()=>setTela("ranking"):undefined} style={{borderRadius:12,padding:"14px 16px",background:bg,position:"relative",overflow:"hidden",boxShadow:`${SH_MD},inset 0 1px 0 rgba(255,255,255,0.09)`,cursor:label==="Posição"?"pointer":undefined}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:topBar,opacity:0.7}}/>
                <div style={{fontSize:9,color:DIM,marginBottom:7,letterSpacing:2,textTransform:"uppercase",fontWeight:700,fontFamily:labelFont||FD}}>{label}</div>
                <div style={{fontSize:38,fontWeight:400,color:cor,lineHeight:1,fontFamily:FD,letterSpacing:1}}>{val}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:6,padding:"12px 14px 0",flexWrap:"wrap",justifyContent:"center"}}>
          {(isAdmin
            ?[["admin","Início"],["clientes","Clientes"],["resultados","Resultados"],["ranking","Ranking"]]
            :bloqueado
              ?[["ranking","Ranking"]]
              :[["jogos","Fase de Grupos"],["matamata","Mata-Mata"],["ranking","Ranking"]]
          ).map(([t,l])=>(
            <button key={t} className="pill btn" style={{
              padding:"7px 18px",borderRadius:20,
              border:tela===t?`1px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
              fontSize:13,
              background:tela===t?`linear-gradient(135deg,${RED},#a30614)`:"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
              color:tela===t?"#fff":MUTE,
              fontWeight:tela===t?600:500,
              fontFamily:FB,
              boxShadow:tela===t?"inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)":"inset 0 1px 0 rgba(255,255,255,0.07),inset 0 -1px 0 rgba(0,0,0,0.1)",
            }} onClick={async()=>{
              setTela(t);
              if(t==="clientes")await carregarClientes();
              if(t==="resultados")await carregarJogos();
              if(t==="ranking"){await Promise.all([carregarJogos(),carregarClientes(),carregarTodosPalpites()]);}
              if((t==="jogos"||t==="matamata")&&!isAdmin){await carregarPalpites(user.id);}
            }}>{l}</button>
          ))}
        </div>

        {tela==="admin"&&(
          <div className="screen" style={{margin:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
            <div className="card glass" style={{borderRadius:12,padding:"1.25rem",boxShadow:SH_SM}}>
              <p style={{margin:0,fontSize:13,color:MUTE,lineHeight:1.7}}>Use o menu acima para gerenciar clientes, inserir resultados e acompanhar o ranking.</p>
            </div>
            <AdminControleHorario
              horarioComercial={horarioComercial}
              liberadoManual={liberadoManual}
              onToggle={toggleLiberadoManual}
            />
            <div className="card glass" style={{borderRadius:12,padding:"1.25rem",boxShadow:SH_SM,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(216,9,27,0.4),transparent)"}}/>
              <div style={{fontSize:12,fontWeight:700,color:"#e0e0e0",marginBottom:4,fontFamily:FD}}>Ferramentas de teste</div>
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
        {tela==="ranking"   &&<div className="screen"><RankingView ranking={ranking} myId={user.id}/></div>}
        {tela==="matamata"&&!isAdmin&&<div className="screen"><ListaMataMata jogos={jogos.filter(j=>j.fase&&j.fase!=="grupos")} palpites={palpites.filter(p=>p.cliente_id===user.id)} onSalvar={salvarPalpite} onDeletar={deletarPalpite}/></div>}
        {tela==="jogos"     &&<div className="screen"><ListaJogos jogos={jogos} palpites={palpites.filter(p=>p.cliente_id===user.id)} onSalvar={salvarPalpite} onDeletar={deletarPalpite} loading={loading}/></div>}

        <div style={{padding:"2rem 1rem 1.5rem",textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:20,marginBottom:12,opacity:0.3}}>
            <img src={SUPA+"/ipiranga%20logo.png"} alt="" style={{height:16,filter:"brightness(0) invert(1)"}}/>
            <img src={SUPA+"/bel%20lube%20logo.png"} alt="" style={{height:20,filter:"brightness(0) invert(1)"}}/>
            <img src={SUPA+"/texaco%20logo.png"}   alt="" style={{height:16,filter:"brightness(0) invert(1)"}}/>
          </div>
          <div style={{fontSize:9,color:"#2a2a2a",letterSpacing:1}}>by <span style={{color:"#3a3a3a",fontWeight:600}}>Gerth Consultoria</span></div>
        </div>
      </div>
    </>
  );
}

/* ─── VISUAIS CARROSSEL ──────────────────────────────────────────────────── */
function Visual1() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" className="scale-in">
      <rect x="50" y="100" width="30" height="6" rx="3" fill={YELLOW} opacity="0.9"/>
      <rect x="44" y="106" width="42" height="5" rx="2.5" fill={YELLOW} opacity="0.7"/>
      <rect x="61" y="82" width="8" height="20" rx="2" fill={YELLOW} opacity="0.8"/>
      <path d="M42 30 Q42 80 65 82 Q88 80 88 30 Z" fill={YELLOW}/>
      <path d="M52 35 Q50 58 58 70" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M42 38 Q28 38 28 52 Q28 64 42 62" fill="none" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
      <path d="M88 38 Q102 38 102 52 Q102 64 88 62" fill="none" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
      <circle cx="25" cy="22" r="2.5" fill={RED} opacity="0.8"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/></circle>
      <circle cx="105" cy="30" r="2" fill={RED} opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.5s" repeatCount="indefinite"/></circle>
      <circle cx="18" cy="60" r="1.5" fill={YELLOW} opacity="0.5"><animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite"/></circle>
      <circle cx="112" cy="55" r="2" fill={YELLOW} opacity="0.5"><animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" repeatCount="indefinite"/></circle>
      <clipPath id="c1"><path d="M42 30 Q42 80 65 82 Q88 80 88 30 Z"/></clipPath>
      <rect x="42" y="30" width="8" height="52" fill={RED} opacity="0.25" clipPath="url(#c1)"/>
      <rect x="80" y="30" width="8" height="52" fill={RED} opacity="0.25" clipPath="url(#c1)"/>
    </svg>
  );
}

function VisualPontos() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10,width:220}}>
      {[
        {icone:"10",label:"PLACAR EXATO",ex:"ex: você disse 2×1 e foi 2×1",cor:YELLOW},
        {icone:"5",label:"RESULTADO CERTO",ex:"ex: você disse 2×1 e foi 3×1",cor:"#d0d0d0"},
        {icone:"×2",label:"JOGOS DO BRASIL",ex:"pontuação dobrada em todo jogo",cor:"#4ade80"},
        {icone:"0",label:"ERROU",ex:"ex: você disse 2×1 e foi 0×1",cor:"#444"},
      ].map(({icone,label,ex,cor})=>(
        <div key={label} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 14px",border:"0.5px solid rgba(255,255,255,0.08)"}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:cor==="#444"?"#1a1a1a":`${cor}22`,border:`1.5px solid ${cor==="#444"?"#333":cor}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FD,fontSize:icone.length>2?13:20,color:cor,flexShrink:0}}>{icone}</div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:cor,letterSpacing:1}}>{label}</div>
            <div style={{fontSize:10,color:DIM,marginTop:2}}>{ex}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Visual3() {
  const premios = [
    {pos:"1º",valor:"R$ 500,00",cor:YELLOW,size:24},
    {pos:"2º",valor:"R$ 300,00",cor:"#cdd2db",size:20},
    {pos:"3º",valor:"R$ 200,00",cor:"#d08a3e",size:18},
  ];
  return (
    <div className="scale-in" style={{width:300,borderRadius:11,overflow:"hidden",boxShadow:SH_LG,background:CARD,border:`0.5px solid ${BORDER}`,position:"relative"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${RED} 30%,${YELLOW} 70%,transparent)`,opacity:0.6}}/>
      <div style={{padding:"14px 18px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
          <div style={{width:16,height:2,background:RED,borderRadius:1,flexShrink:0}}/>
          <span style={{fontSize:8,fontWeight:700,color:YELLOW,letterSpacing:3,textTransform:"uppercase"}}>Premiação</span>
        </div>
        {premios.map((p,i)=>(
          <div key={p.pos}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0"}}>
              <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                <span style={{fontFamily:FD,fontSize:22,fontWeight:400,color:p.cor,lineHeight:1}}>{p.pos}</span>
                <span style={{fontSize:7,fontWeight:700,color:MUTE,letterSpacing:1.5,textTransform:"uppercase"}}>lugar</span>
              </div>
              <span style={{fontFamily:FD,fontSize:p.size,fontWeight:400,color:p.cor,lineHeight:1,letterSpacing:-0.5}}>{p.valor}</span>
            </div>
            {i < premios.length - 1 && <div style={{height:"0.5px",background:BORDER2}}/>}
          </div>
        ))}
      </div>
      <div style={{marginTop:8,background:"#1d1407",borderTop:`0.5px solid rgba(255,209,1,0.18)`,padding:"10px 18px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div>
            <div style={{fontSize:8,fontWeight:700,color:YELLOW,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>Acertou o Campeão</div>
            <div style={{fontSize:9,color:DIM,lineHeight:1.4}}>Dividido entre os acertadores</div>
          </div>
          <span style={{fontFamily:FD,fontSize:22,fontWeight:400,color:YELLOW,lineHeight:1,flexShrink:0}}>R$ 500,00</span>
        </div>
      </div>
    </div>
  );
}

function Visual4() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="scale-in">
      <circle cx="60" cy="62" r="42" fill="rgba(216,9,27,0.08)" stroke={RED} strokeWidth="1.5" opacity="0.8"/>
      <circle cx="60" cy="62" r="36" fill="rgba(0,0,0,0.3)"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((ang,i)=>{
        const rad=(ang-90)*Math.PI/180;
        const r1=i%3===0?28:30,r2=33;
        return <line key={i} x1={60+r1*Math.cos(rad)} y1={62+r1*Math.sin(rad)} x2={60+r2*Math.cos(rad)} y2={62+r2*Math.sin(rad)} stroke={i%3===0?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.2)"} strokeWidth={i%3===0?2:1}/>;
      })}
      <line x1="60" y1="62" x2="60" y2="34" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 60 62" to="360 60 62" dur="60s" repeatCount="indefinite"/>
      </line>
      <line x1="60" y1="62" x2="75" y2="50" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="60" cy="62" r="4" fill={RED}/>
      <circle cx="60" cy="62" r="2" fill="#fff"/>
      <text x="60" y="78" textAnchor="middle" fontSize="7" fill={RED} fontWeight="700" letterSpacing="2" fontFamily="FIFATournament,sans-serif">APITA</text>
      <rect x="57" y="18" width="6" height="8" rx="3" fill={RED} opacity="0.9"/>
    </svg>
  );
}

function Visual5() {
  return (
    <div style={{textAlign:"center"}} className="scale-in">
      <img src={LOGO_BRANCA} alt="Bet Lube" style={{height:110,width:"auto",objectFit:"contain"}}/>
      <div style={{marginTop:12,display:"flex",justifyContent:"center",gap:4}}>
        {[RED,YELLOW,RED].map((c,i)=>(
          <div key={i} style={{width:i===1?24:8,height:3,borderRadius:2,background:c}}/>
        ))}
      </div>
    </div>
  );
}

/* ─── VISUAL CAMPEÃO ────────────────────────────────────────────────────── */
function VisualCampeao() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="scale-in">
      <rect x="42" y="88" width="26" height="5" rx="2.5" fill={YELLOW} opacity="0.9"/>
      <rect x="37" y="93" width="36" height="4" rx="2" fill={YELLOW} opacity="0.7"/>
      <rect x="52" y="72" width="6" height="18" rx="2" fill={YELLOW} opacity="0.8"/>
      <path d="M30 22 Q30 68 55 70 Q80 68 80 22 Z" fill={YELLOW}/>
      <path d="M30 30 Q16 30 16 46 Q16 58 30 56" fill="none" stroke={YELLOW} strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
      <path d="M80 30 Q94 30 94 46 Q94 58 80 56" fill="none" stroke={YELLOW} strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
      <polygon points="55,36 57.5,43 65,43 59,47.5 61.5,55 55,50.5 48.5,55 51,47.5 45,43 52.5,43" fill={RED} opacity="0.9"/>
      <clipPath id="cup"><path d="M30 22 Q30 68 55 70 Q80 68 80 22 Z"/></clipPath>
      <rect x="30" y="22" width="8" height="48" fill="rgba(255,255,255,0.15)" clipPath="url(#cup)"/>
      <circle cx="28" cy="16" r="2.5" fill={RED} opacity="0.7"><animate attributeName="opacity" values="0.7;0.1;0.7" dur="2.2s" repeatCount="indefinite"/></circle>
      <circle cx="82" cy="20" r="2" fill={YELLOW} opacity="0.6"><animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.8s" repeatCount="indefinite"/></circle>
    </svg>
  );
}

/* ─── TELA CAMPEÃO ───────────────────────────────────────────────────────── */
function TelaCampeao({ user, onConfirmar }) {
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState(user.palpite_campeao || null);
  const [salvando, setSalvando] = useState(false);

  const timesFiltrados = TIMES_COPA.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase())
  );

  async function confirmar() {
    if (!selecionado || salvando) return;
    setSalvando(true);
    const { error } = await supabase.from("clientes").update({ palpite_campeao: selecionado }).eq("id", user.id);
    if (error) { setSalvando(false); return; }
    onConfirmar(selecionado);
  }

  return (
    <div className="scale-in" style={{
      background:"rgba(255,255,255,0.97)", borderRadius:20,
      width:"100%", maxWidth:460, overflow:"hidden",
      boxShadow:"0 24px 60px rgba(0,0,0,0.7),0 0 0 0.5px rgba(255,255,255,0.12),inset 0 1px 0 rgba(255,255,255,0.8)",
      display:"flex", flexDirection:"column", maxHeight:"90dvh",
    }}>
      <div style={{
        background:"linear-gradient(160deg,#0d0d14,#080810)",
        minHeight:130, display:"flex", alignItems:"center",
        justifyContent:"center", flexShrink:0,
        borderBottom:"0.5px solid rgba(255,255,255,0.06)",
      }}>
        <VisualCampeao/>
      </div>

      <div style={{padding:"1.25rem 1.5rem 0.75rem", flexShrink:0}}>
        <div style={{fontSize:22,fontWeight:800,color:DARK,marginBottom:4,fontFamily:FD,letterSpacing:-0.5,lineHeight:1.15}}>
          Quem vai ser campeão?
        </div>
        <div style={{fontSize:13,color:"#555",lineHeight:1.75}}>
          Seu palpite vale como critério de desempate no ranking.
        </div>
      </div>

      <div style={{padding:"0 1.5rem 0.5rem", flexShrink:0}}>
        <input
          value={busca}
          onChange={e=>setBusca(e.target.value)}
          placeholder="Buscar seleção..."
          style={{
            width:"100%", boxSizing:"border-box",
            padding:"9px 12px", borderRadius:8,
            border:"1.5px solid #e0e0e0", fontSize:13,
            background:"#f8f8f8", color:"#111",
            fontFamily:FB, outline:"none",
            transition:"border-color 180ms ease",
          }}
          onFocus={e=>e.target.style.borderColor=RED}
          onBlur={e=>e.target.style.borderColor="#e0e0e0"}
        />
      </div>

      <div className="team-list" style={{
        flex:1, margin:"0 1.5rem", minHeight:0,
        borderRadius:8, border:"1px solid #ebebeb", overflow:"hidden",
        overflowY:"auto",
      }}>
        {timesFiltrados.map((t,i)=>{
          const sel=selecionado===t.nome;
          return (
            <div key={t.nome} onClick={()=>setSelecionado(t.nome)} style={{
              display:"flex", alignItems:"center", gap:11,
              padding:"9px 13px", cursor:"pointer",
              background: sel ? RED : "transparent",
              borderBottom: i<timesFiltrados.length-1 ? "0.5px solid #f0f0f0" : "none",
              transition:"background 140ms ease",
            }}>
              <Flag time={t.nome} size={24}/>
              <span style={{
                fontSize:13, fontFamily:FB,
                fontWeight:sel?600:400,
                color:sel?"#fff":"#1a1a1a",
                flex:1,
              }}>{t.nome}</span>
              {sel&&(
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l4 4 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          );
        })}
        {timesFiltrados.length===0&&(
          <div style={{padding:"2rem",textAlign:"center",color:"#bbb",fontSize:13,fontFamily:FB}}>
            Nenhuma seleção encontrada
          </div>
        )}
      </div>

      <div style={{padding:"0.75rem 1.5rem 1.25rem", flexShrink:0}}>
        <button className="btn" onClick={confirmar} disabled={!selecionado||salvando} style={{
          width:"100%", border:"none", padding:"14px",
          fontSize:12, fontWeight:700, letterSpacing:2,
          textTransform:"uppercase", fontFamily:FB,
          background: selecionado&&!salvando ? `linear-gradient(135deg,${RED},#a30614)` : "#e8e8e8",
          color: selecionado&&!salvando ? "#fff" : "#aaa",
          borderRadius:8,
          boxShadow: selecionado&&!salvando ? "0 4px 20px rgba(216,9,27,0.35)" : "none",
          cursor: selecionado&&!salvando ? "pointer" : "not-allowed",
          transition:"all 200ms ease",
        }}>
          {salvando?"SALVANDO...":selecionado?`CONFIRMAR — ${selecionado.toUpperCase()}`:"SELECIONE UMA SELEÇÃO"}
        </button>
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
      <div style={{background:"linear-gradient(160deg,#0d0d14,#080810)",height:280,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",borderBottom:"0.5px solid rgba(255,255,255,0.06)",overflow:"hidden"}}>
        <button className="btn" onClick={onFim} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.07)",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>×</button>
        <div key={atual} className="fade-up">{slide.visual}</div>
      </div>
      <div style={{padding:"1.4rem 1.6rem 0.8rem"}}>
        <div key={"t"+atual} className="fade-up" style={{fontSize:22,fontWeight:800,color:DARK,marginBottom:8,fontFamily:FD,letterSpacing:-0.5,lineHeight:1.15}}>{slide.titulo}</div>
        <div key={"d"+atual} className="fade-up" style={{fontSize:13,color:"#555",lineHeight:1.75,animationDelay:"40ms"}}>{slide.texto}</div>
        {slide.subtexto&&<div key={"s"+atual} className="fade-up" style={{fontSize:11,color:"#aaa",marginTop:10,animationDelay:"80ms"}}>{slide.subtexto}</div>}
      </div>
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

/* ─── PREMIOS ────────────────────────────────────────────────────────────── */
function PremiosCard() {
  return (
    <div style={{borderRadius:9,overflow:"hidden",marginBottom:12,boxShadow:SH_SM,border:`0.5px solid ${BORDER}`,background:CARD}}>
      {/* Linha 1: label + 1º 2º 3º */}
      <div style={{display:"flex",alignItems:"stretch",minHeight:40}}>
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"0 12px",flexShrink:0}}>
          <div style={{width:14,height:2,background:RED,borderRadius:1}}/>
          <span style={{fontSize:8,fontWeight:700,color:YELLOW,letterSpacing:2.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>Prêmios</span>
        </div>
        <div style={{borderLeft:`0.5px solid ${BORDER2}`,display:"flex",alignItems:"center",flex:1,padding:"0 4px"}}>
          {[["1º","R$500",YELLOW],["2º","R$300","#cdd2db"],["3º","R$200","#d08a3e"]].map(([pos,val,cor],i)=>(
            <div key={pos} style={{display:"flex",alignItems:"baseline",gap:2,padding:"0 8px",borderRight:i<2?`0.5px solid ${BORDER2}`:undefined}}>
              <span style={{fontFamily:FD,fontSize:11,color:cor,lineHeight:1}}>{pos}</span>
              <span style={{fontFamily:FD,fontSize:15,color:cor,lineHeight:1,letterSpacing:-0.3}}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Linha 2: campeão — largura total */}
      <div style={{background:"#1d1407",borderTop:`0.5px solid rgba(255,209,1,0.18)`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 12px",gap:8}}>
        <span style={{fontSize:10,fontWeight:600,color:YELLOW,letterSpacing:0.5}}>Acertou o Campeão da Copa</span>
        <span style={{fontFamily:FD,fontSize:14,color:YELLOW,lineHeight:1,letterSpacing:-0.2,whiteSpace:"nowrap"}}>R$500 *</span>
      </div>
    </div>
  );
}

/* ─── ADMIN CONTROLE HORARIO ─────────────────────────────────────────────── */
function AdminControleHorario({ horarioComercial, liberadoManual, onToggle }) {
  const [saving, setSaving] = useState(false);

  async function handleToggle() {
    setSaving(true);
    try {
      await onToggle(!liberadoManual);
    } finally {
      setSaving(false);
    }
  }

  const emHorario = horarioComercial;
  const cor = liberadoManual ? YELLOW : emHorario ? RED : DIM;

  return (
    <div className="card glass" style={{
      borderRadius:12,padding:"1.25rem",boxShadow:SH_SM,
      position:"relative",overflow:"hidden",
      border:`0.5px solid ${liberadoManual?"rgba(255,209,1,0.3)":BORDER}`,
      transition:"border-color 0.4s",
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,
        background:liberadoManual
          ?`linear-gradient(90deg,transparent,${YELLOW},transparent)`
          :`linear-gradient(90deg,transparent,${BORDER2},transparent)`,
        opacity:liberadoManual?0.6:1,transition:"opacity 0.4s",
      }}/>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <div style={{width:16,height:2,background:cor,borderRadius:1,flexShrink:0,transition:"background 0.3s"}}/>
        <span style={{fontSize:9,fontWeight:700,color:cor,letterSpacing:3,textTransform:"uppercase",transition:"color 0.3s"}}>Controle de Acesso</span>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{
          display:"inline-flex",alignItems:"center",gap:7,
          background:liberadoManual?"rgba(255,209,1,0.07)":emHorario?"rgba(216,9,27,0.07)":"rgba(107,114,128,0.07)",
          border:`0.5px solid ${liberadoManual?"rgba(255,209,1,0.22)":emHorario?"rgba(216,9,27,0.22)":"rgba(107,114,128,0.18)"}`,
          borderRadius:7,padding:"7px 11px",
        }}>
          <div style={{
            width:7,height:7,borderRadius:"50%",flexShrink:0,
            background:cor,
            boxShadow:liberadoManual?`0 0 7px ${YELLOW}90`:emHorario?`0 0 7px ${RED}90`:"none",
            transition:"background 0.3s,box-shadow 0.3s",
          }}/>
          <span style={{fontSize:11,fontWeight:600,color:cor,fontFamily:FB,letterSpacing:0.3,transition:"color 0.3s"}}>
            {liberadoManual
              ?"Site liberado manualmente"
              :emHorario
                ?"Bloqueio ativo — horario comercial"
                :"Bloqueio automatico (fora do horario)"}
          </span>
        </div>
      </div>
      <button
        className="btn"
        onClick={handleToggle}
        disabled={saving}
        style={{
          borderRadius:8,padding:"10px 20px",
          fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",
          fontFamily:FB,cursor:saving?"not-allowed":"pointer",
          opacity:saving?0.5:1,transition:"opacity 0.2s",
          ...(liberadoManual
            ?{border:"1px solid rgba(216,9,27,0.4)",background:"rgba(216,9,27,0.08)",color:RED}
            :{border:"1px solid rgba(255,209,1,0.4)",background:"rgba(255,209,1,0.08)",color:YELLOW}),
        }}
      >
        {saving?"Salvando...":liberadoManual?"Voltar ao bloqueio automatico":"Liberar site agora"}
      </button>
    </div>
  );
}

/* ─── RANKING ────────────────────────────────────────────────────────────── */
function RankingView({ ranking, myId }) {
  const podio = ranking.slice(0,3);
  const todos  = ranking;
  const MEDAL = [
    {cor:"#FFD700",grad:"linear-gradient(145deg,#FFD700 0%,#997200 50%,#FFD700 100%)",glow:"inset 0 1px 0 rgba(255,255,255,0.25),inset 0 -1px 0 rgba(0,0,0,0.15)",border:"rgba(255,215,0,0.55)",h:112,pos:"1"},
    {cor:"#C0C0C0",grad:"linear-gradient(145deg,#C0C0C0 0%,#686868 50%,#C0C0C0 100%)",glow:"inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.1)",border:"rgba(192,192,192,0.45)",h:82,pos:"2"},
    {cor:"#CD7F32",grad:"linear-gradient(145deg,#CD7F32 0%,#7A3E18 50%,#CD7F32 100%)",glow:"inset 0 1px 0 rgba(255,255,255,0.18),inset 0 -1px 0 rgba(0,0,0,0.1)",border:"rgba(205,127,50,0.45)",h:64,pos:"3"},
  ];
  return (
    <div style={{padding:"14px"}}>
      <PremiosCard/>
      {ranking.length===0&&(
        <div style={{textAlign:"center",padding:"3rem 1rem",color:DIM,fontSize:13}}>Nenhum palpite registrado ainda.</div>
      )}
      {podio.length>=1&&(
        <div className="scale-in" style={{borderRadius:16,padding:"1.5rem 1rem 0",marginBottom:20,overflow:"hidden",position:"relative",background:"linear-gradient(160deg,#131313,#0b0b0b)",border:`0.5px solid #2a2a2a`,boxShadow:`${SH_LG},inset 0 0 60px rgba(255,215,0,0.015)`}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(255,215,0,0.55),transparent)"}}/>
          <div style={{textAlign:"center",color:"#FFD700",fontSize:9,fontWeight:700,letterSpacing:4,marginBottom:18,textTransform:"uppercase",opacity:0.65}}>Pódio</div>
          <div className="stagger" style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8}}>
            {[1,0,2].map(idx=>{
              const c=podio[idx];
              if (!c) return <div key={idx} style={{flex:1}}/>;
              const m=MEDAL[idx];
              const isMe=c.id===myId;
              return (
                <div key={c.id} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,color:isMe?RED:DIM,marginBottom:2,fontWeight:isMe?700:400,letterSpacing:isMe?1.5:0.5,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {isMe?"Você":c.nome.split(" ")[0]}
                  </div>
                  <div style={{fontSize:18,fontWeight:400,color:m.cor,marginBottom:7,fontFamily:FD}}>
                    {c.pts}<span style={{fontSize:9,opacity:0.6,marginLeft:1}}>pts</span>
                  </div>
                  <div style={{background:m.grad,borderRadius:"8px 8px 0 0",height:m.h,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:m.glow,border:`1px solid ${m.border}`,borderBottom:"none"}}>
                    <div style={{fontSize:32,fontWeight:400,color:"rgba(0,0,0,0.75)",fontFamily:FD,lineHeight:1}}>{m.pos}</div>
                    <div style={{fontSize:7,fontWeight:800,color:"rgba(0,0,0,0.4)",letterSpacing:1.5,marginTop:2}}>LUGAR</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {todos.length>0&&(
        <>
          <div style={{fontSize:9,fontWeight:700,color:DIM,letterSpacing:2.5,padding:"4px 0 10px",textTransform:"uppercase",fontFamily:FD}}>Classificação completa</div>
          <div className="stagger">
            {todos.map((c,i)=>{
              const isMe=c.id===myId;
              const MEDAL_COLORS=["#FFD700","#C0C0C0","#CD7F32"];
              const isTop3=i<3;
              return (
                <div key={c.id} className="card card-glass" style={{borderRadius:11,padding:"12px 15px",marginBottom:7,display:"flex",alignItems:"center",gap:13,background:isMe?"linear-gradient(135deg,#160202,#0c0c0c)":isTop3?"linear-gradient(135deg,#131108,#0c0c0c)":"linear-gradient(160deg,#111,#0c0c0c)",border:`0.5px solid ${isMe?"rgba(216,9,27,0.4)":isTop3?`${MEDAL_COLORS[i]}22`:BORDER2}`,boxShadow:isMe?`${SH_SM},0 0 10px rgba(216,9,27,0.07)`:SH_SM}}>
                  <div style={{minWidth:32,textAlign:"center"}}>
                    {isTop3
                      ?<div style={{width:26,height:26,borderRadius:"50%",background:MEDAL_COLORS[i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"rgba(0,0,0,0.7)",fontFamily:FD}}>{i+1}</div>
                      :<span style={{fontSize:14,fontWeight:400,color:DIM,fontFamily:FD}}>{i+1}º</span>
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
function ListaJogos({ jogos, palpites, onSalvar, onDeletar, loading }) {
  const [rodada,setRodada] = useState("1");
  const [diaSel,setDiaSel] = useState(null);
  const calRef = useRef(null);

  const RODADAS = [
    {id:"1",label:"1ª Rodada",inicio:"2026-06-11",fim:"2026-06-17"},
    {id:"2",label:"2ª Rodada",inicio:"2026-06-18",fim:"2026-06-23"},
    {id:"3",label:"3ª Rodada",inicio:"2026-06-24",fim:"2026-06-27"},
  ];

  const filtradosRodada = jogos.filter(j=>{const r=RODADAS.find(x=>x.id===rodada);const d=diaBR(j.data_hora);return j.fase==="grupos"&&d>=r.inicio&&d<=r.fim;});
  const todosOsDias = [...new Set(filtradosRodada.map(j=>diaBR(j.data_hora)))].sort();

  useEffect(()=>{
    if (todosOsDias.length===0){setDiaSel(null);return;}
    const hoje=diaBR(new Date().toISOString());
    const proximo=todosOsDias.find(d=>d>=hoje)||todosOsDias[todosOsDias.length-1];
    setDiaSel(proximo);
  },[rodada,jogos.length]); // eslint-disable-line

  useEffect(()=>{
    if (!calRef.current||!diaSel) return;
    const btn=calRef.current.querySelector(`[data-dia="${diaSel}"]`);
    if (btn) btn.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  },[diaSel]);

  const jogosDoDia = filtradosRodada
    .filter(j=>diaBR(j.data_hora)===diaSel)
    .sort((a,b)=>new Date(a.data_hora)-new Date(b.data_hora));

  return (
    <div style={{paddingTop:14}}>
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
      <div style={{display:"flex",gap:6,padding:"0 14px 10px",flexWrap:"wrap",justifyContent:"center"}}>
        {RODADAS.map(r=>(
          <button key={r.id} className="pill btn" onClick={()=>setRodada(r.id)} style={{
            padding:"5px 14px",borderRadius:20,
            border:rodada===r.id?`1px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
            background:rodada===r.id?`linear-gradient(135deg,${RED},#a30614)`:"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
            color:rodada===r.id?"#fff":MUTE,
            fontSize:12,fontWeight:rodada===r.id?600:500,
            fontFamily:FB,
            boxShadow:rodada===r.id?"inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)":"inset 0 1px 0 rgba(255,255,255,0.07),inset 0 -1px 0 rgba(0,0,0,0.1)",
          }}>{r.label}</button>
        ))}
      </div>

      {todosOsDias.length>0&&(
        <div ref={calRef} className="cal-scroll" style={{display:"flex",gap:7,padding:"0 14px 14px",justifyContent:"center"}}>
          {todosOsDias.map(dia=>{
            const {sem,num,mes}=formatCalDia(dia);
            const ativo=dia===diaSel;
            return (
              <button key={dia} data-dia={dia} className="btn" onClick={()=>setDiaSel(dia)} style={{
                flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",
                padding:"10px 14px",borderRadius:12,gap:2,minWidth:54,
                border:ativo?`1.5px solid ${RED}`:"0.5px solid rgba(255,255,255,0.1)",
                background:ativo?`linear-gradient(135deg,${RED},#a30614)`:"linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
                boxShadow:ativo?`0 4px 16px rgba(216,9,27,0.25),inset 0 1px 0 rgba(255,255,255,0.2),inset 0 -1px 0 rgba(0,0,0,0.2)`:"inset 0 1px 0 rgba(255,255,255,0.08),inset 0 -1px 0 rgba(0,0,0,0.15)",
                cursor:"pointer",transition:"all 180ms var(--ease-out)",
              }}>
                <span style={{fontSize:9,fontWeight:700,color:ativo?"rgba(255,255,255,0.7)":DIM,letterSpacing:1}}>{sem}</span>
                <span style={{fontSize:26,fontWeight:400,color:"#fff",fontFamily:FD,lineHeight:1.05}}>{num}</span>
                <span style={{fontSize:9,fontWeight:600,color:ativo?"rgba(255,255,255,0.6)":DIM,letterSpacing:0.5}}>{mes}</span>
              </button>
            );
          })}
        </div>
      )}

      {diaSel&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"2px 14px 12px"}}>
          <div style={{flex:1,height:"0.5px",background:BORDER}}/>
          <span style={{fontSize:10,color:DIM,fontWeight:600,textTransform:"uppercase",whiteSpace:"nowrap",letterSpacing:1}}>
            {formatDiaLabel(diaSel)}
          </span>
          <div style={{flex:1,height:"0.5px",background:BORDER}}/>
        </div>
      )}

      <div className="stagger" style={{padding:"0 14px 24px"}}>
        {jogosDoDia.length===0&&(
          <div style={{textAlign:"center",padding:"3rem 1rem"}}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{margin:"0 auto 16px",display:"block",opacity:0.2}}>
              <circle cx="24" cy="24" r="20" fill="none" stroke="#fff" strokeWidth="2"/>
              <path d="M16 24h16M24 16v16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div style={{fontSize:13,color:DIM,fontFamily:FD,fontWeight:500}}>Nenhum jogo nesta data</div>
            <div style={{fontSize:11,color:"#333",marginTop:4}}>Selecione outro dia no calendário</div>
          </div>
        )}
        {jogosDoDia.map(j=>{
          const p=palpites.find(x=>x.jogo_id===j.id);
          const passou=j.encerrado||new Date(j.data_hora)<=new Date();
          const isBR=j.time1==="Brasil"||j.time2==="Brasil";
          const ptMax=isBR?20:10;
          const ptMid=isBR?10:5;
          const pts=p&&j.resultado_g1!=null?calcPontos(p.g1,p.g2,j.resultado_g1,j.resultado_g2,isBR):null;
          return (
            <div key={j.id} className={"card card-glass"+(isBR?" card-brasil":"")} style={{
              borderRadius:14,padding:"14px",marginBottom:10,
              minHeight:176,
              position:"relative",overflow:"hidden",
              border:isBR?"1px solid rgba(255,209,1,0.2)":`0.5px solid ${BORDER2}`,
              background:isBR?"linear-gradient(160deg,#161200,#0d0d0d)":"linear-gradient(160deg,#131313,#0c0c0c)",
              boxShadow:isBR?`0 4px 20px rgba(0,0,0,0.6),0 0 0 1px rgba(255,209,1,0.08),inset 0 1px 0 rgba(255,255,255,0.04)`:`${SH_MD},inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}>
              {isBR&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${YELLOW},transparent)`,opacity:0.6}}/>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
                <div style={{background:isBR?"rgba(255,209,1,0.08)":"rgba(255,255,255,0.04)",color:isBR?YELLOW:DIM,fontSize:9,fontWeight:700,padding:"3px 8px",borderRadius:5,letterSpacing:1,border:isBR?"0.5px solid rgba(255,209,1,0.15)":"0.5px solid rgba(255,255,255,0.06)"}}>GRP {j.grupo} · {formatHora(j.data_hora)}</div>
                {pts!==null&&(
                  <span style={{fontSize:9,borderRadius:6,padding:"3px 9px",fontWeight:700,letterSpacing:0.5,background:pts===ptMax?"rgba(255,209,1,0.12)":pts===ptMid?"rgba(255,255,255,0.06)":"rgba(216,9,27,0.08)",color:pts===ptMax?YELLOW:pts===ptMid?"#bbb":"#444",border:pts===ptMax?"0.5px solid rgba(255,209,1,0.25)":pts===ptMid?"0.5px solid rgba(255,255,255,0.12)":"0.5px solid rgba(216,9,27,0.18)"}}>{pts===ptMax?`+${ptMax} EXATO`:pts===ptMid?`+${ptMid} VENCEDOR`:"ERROU"}</span>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                <div style={{flex:1}}>
                  <Flag time={j.time1} size={52}/>
                  <div style={{fontWeight:600,fontSize:12,marginTop:6,color:isBR&&j.time1==="Brasil"?YELLOW:"#e0e0e0",letterSpacing:0.2}}>{j.time1}</div>
                </div>
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
                    <PalpiteInput key={p?.id??`empty-${j.id}`} jogoId={j.id} palpiteAtual={p} onSalvar={onSalvar} onDeletar={()=>onDeletar(p?.id)} isBrasil={isBR}/>
                  )}
                </div>
                <div style={{flex:1,textAlign:"right"}}>
                  <div style={{display:"flex",justifyContent:"flex-end"}}><Flag time={j.time2} size={52}/></div>
                  <div style={{fontWeight:600,fontSize:12,marginTop:6,color:isBR&&j.time2==="Brasil"?YELLOW:"#e0e0e0",letterSpacing:0.2}}>{j.time2}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>}
    </div>
  );
}

/* ─── ADMIN CLIENTES ─────────────────────────────────────────────────────── */
function AdminClientes({ clientes, onAdd, onToggle }) {
  const [doc,setDoc]   = useState("");
  const [nome,setNome] = useState("");
  const [senha,setSenha]= useState("");
  const [tipo,setTipo] = useState("cliente");
  const inp = {width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:`0.5px solid ${BORDER2}`,fontSize:13,background:"#131313",color:"#e8e8e8",fontFamily:FB};
  return (
    <div style={{padding:"14px"}}>
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
                <span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:c.tipo==="funcionario"?"#60a5fa":YELLOW,background:c.tipo==="funcionario"?"rgba(96,165,250,0.08)":"rgba(255,209,1,0.08)",padding:"2px 6px",borderRadius:4,border:`0.5px solid ${c.tipo==="funcionario"?"rgba(96,165,250,0.2)":"rgba(255,209,1,0.2)"}`}}>{c.tipo==="funcionario"?"FUNC":"CLI"}</span>
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

/* ─── PALPITE INPUT — stepper +/- ───────────────────────────────────────── */
function PalpiteInput({ jogoId, palpiteAtual, onSalvar, onDeletar, isBrasil }) {
  // null = vazio (não preencheu) | número = valor escolhido (0 é válido)
  const [g1, setG1] = useState(palpiteAtual != null ? palpiteAtual.g1 : null);
  const [g2, setG2] = useState(palpiteAtual != null ? palpiteAtual.g2 : null);

  const pronto = g1 !== null && g2 !== null;

  function stepUp(val, setVal) {
    // Se ainda vazio, começa em 0
    setVal(val === null ? 0 : val + 1);
  }

  function stepDown(val, setVal) {
    if (val === null || val === 0) return;
    setVal(val - 1);
  }

  const accentColor  = isBrasil ? YELLOW : RED;
  const accentBg     = isBrasil ? "rgba(255,209,1,0.12)"  : "rgba(216,9,27,0.12)";
  const accentBorder = isBrasil ? "rgba(255,209,1,0.4)"   : "rgba(216,9,27,0.4)";

  function Stepper({ value, onUp, onDown }) {
    const vazio    = value === null;
    const noBottom = vazio || value === 0;
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>

        {/* Botão + */}
        <button
          className="stepper-btn"
          onClick={onUp}
          style={{
            width:36, height:30,
            borderRadius:"9px 9px 4px 4px",
            border:`1px solid ${accentBorder}`,
            background: accentBg,
            color: accentColor,
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1.5v8M1.5 5.5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Valor */}
        <div style={{
          width:44, height:44,
          borderRadius:10,
          background:"linear-gradient(160deg,#1a1a1a,#111)",
          border:`1px solid ${vazio ? "rgba(255,255,255,0.08)" : accentBorder}`,
          boxShadow:"inset 0 2px 6px rgba(0,0,0,0.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily: FD,
          fontSize: vazio ? 11 : 26,
          color: vazio ? "#333" : "#fff",
          userSelect:"none",
          transition:"border-color 180ms ease, font-size 120ms ease",
        }}>
          {vazio ? "—" : value}
        </div>

        {/* Botão − */}
        <button
          className="stepper-btn"
          onClick={() => onDown()}
          disabled={noBottom}
          style={{
            width:36, height:30,
            borderRadius:"4px 4px 9px 9px",
            border:`1px solid ${noBottom ? "rgba(255,255,255,0.05)" : accentBorder}`,
            background: noBottom ? "transparent" : accentBg,
            color: noBottom ? "#222" : accentColor,
            opacity: noBottom ? 0.3 : 1,
            boxShadow:"inset 0 -1px 0 rgba(0,0,0,0.2)",
            cursor: noBottom ? "not-allowed" : "pointer",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1.5 5.5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <Stepper
          value={g1}
          onUp={()   => stepUp(g1, setG1)}
          onDown={()=> stepDown(g1, setG1)}
        />

        {/* Separador */}
        <div style={{ display:"flex", flexDirection:"column", gap:4, opacity:0.3 }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:"#fff" }}/>
          <div style={{ width:4, height:4, borderRadius:"50%", background:"#fff" }}/>
        </div>

        <Stepper
          value={g2}
          onUp={()   => stepUp(g2, setG2)}
          onDown={()=> stepDown(g2, setG2)}
        />
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:6, minHeight:28 }}>
        <button
          className="btn"
          style={{
            border:"none",
            borderRadius:20,
            padding:"6px 20px",
            fontSize:9,
            fontWeight:700,
            letterSpacing:1.5,
            textTransform:"uppercase",
            background: palpiteAtual
              ? "linear-gradient(135deg,#5a020e,#3a0008)"
              : `linear-gradient(135deg,${RED},#a30614)`,
            color:"#fff",
            opacity: pronto ? 1 : 0.35,
            cursor: pronto ? "pointer" : "not-allowed",
            boxShadow: pronto ? "0 3px 12px rgba(216,9,27,0.35)" : "none",
            transition:"opacity 180ms ease, box-shadow 180ms ease",
          }}
          onClick={() => { if (pronto) onSalvar(jogoId, g1, g2); }}
          disabled={!pronto}
        >
          {palpiteAtual ? "Atualizar" : "Salvar"}
        </button>

        {/* Botão lixeira — só aparece se já tem palpite salvo */}
        {palpiteAtual && (
          <button
            className="stepper-btn"
            onClick={() => onDeletar && onDeletar()}
            title="Remover palpite"
            style={{
              width:28, height:28,
              borderRadius:8,
              border:"1px solid rgba(255,255,255,0.08)",
              background:"rgba(255,255,255,0.03)",
              color:"#3a3a3a",
              cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"border-color 160ms ease, color 160ms ease, background 160ms ease",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(216,9,27,0.4)";e.currentTarget.style.color="#D8091B";e.currentTarget.style.background="rgba(216,9,27,0.08)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color="#3a3a3a";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1.5 3h9M4.5 3V2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M9.5 3l-.5 7H3L2.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
