"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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

  const isAdmin = user?.doc === "admin";

  async function login(doc, senha) {
    setLoading(true); setLoginErr("");
    const docLimpo = doc.replace(/\D/g, "") || doc;
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("doc", docLimpo)
      .eq("senha", senha)
      .eq("ativo", true)
      .limit(1);
    if (error || !data.length) {
      setLoginErr("CPF/CNPJ ou senha incorretos.");
      setLoading(false); return;
    }
    const u = data[0];
    setUser(u);
    await carregarJogos();
    if (u.doc === "admin") { await carregarClientes(); setTela("admin"); }
    else { await carregarPalpites(u.id); setTela("jogos"); }
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

  function flash(text, err = false) { setMsg({ text, err }); setTimeout(() => setMsg(""), 2500); }

  async function salvarPalpite(jogoId, g1, g2) {
    const exist = palpites.find(p => p.jogo_id === jogoId);
    const payload = { cliente_id: user.id, jogo_id: jogoId, g1: parseInt(g1), g2: parseInt(g2) };
    if (exist) {
      await supabase.from("palpites").update({ g1: parseInt(g1), g2: parseInt(g2) }).eq("id", exist.id);
    } else {
      await supabase.from("palpites").insert(payload);
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
  const meusPts = user ? (ranking.find(r => r.id === user.id)?.pts || 0) : 0;

  const s = {
    wrap: { fontFamily: "sans-serif", maxWidth: 680, margin: "0 auto", padding: "1rem" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #eee", paddingBottom: "0.75rem" },
    btn: { cursor: "pointer", border: "1px solid #ddd", borderRadius: 8, padding: "6px 14px", fontSize: 13, background: "transparent" },
    btnP: { cursor: "pointer", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 14, background: "#1D9E75", color: "#fff", fontWeight: 500 },
    card: { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 12 },
    inp: { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 },
    num: { width: 52, textAlign: "center", padding: "6px 4px", borderRadius: 8, border: "1px solid #ddd", fontSize: 18, fontWeight: 500 },
    nav: { display: "flex", gap: 8, marginBottom: "1.5rem", flexWrap: "wrap" },
    navB: (a) => ({ cursor: "pointer", padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, background: a ? "#1D9E75" : "transparent", color: a ? "#fff" : "#333", fontWeight: a ? 500 : 400 }),
    tag: (p) => ({ fontSize: 11, borderRadius: 6, padding: "2px 8px", background: p === 3 ? "#EAF3DE" : p === 1 ? "#FAEEDA" : "#f5f5f5", color: p === 3 ? "#3B6D11" : p === 1 ? "#854F0B" : "#888" }),
  };

  if (tela === "login") return (
    <div style={s.wrap}>
      <div style={{ textAlign: "center", marginBottom: "2rem", paddingTop: "2rem" }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Campanha Copa 2026</div>
        <div style={{ fontSize: 24, fontWeight: 500 }}>Bolão Ipiranga & Texaco</div>
      </div>
      <div style={{ ...s.card, maxWidth: 360, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 4 }}>CPF ou CNPJ</label>
          <input id="doc" style={s.inp} placeholder="Somente números" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 4 }}>Senha</label>
          <input id="senha" type="password" style={s.inp} placeholder="Sua senha" />
        </div>
        {loginErr && <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{loginErr}</p>}
        <button style={{ ...s.btnP, width: "100%", opacity: loading ? 0.7 : 1 }}
          onClick={() => login(document.getElementById("doc").value, document.getElementById("senha").value)}
          disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </div>
    </div>
  );

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{isAdmin ? "Painel Admin" : user?.nome}</div>
          {!isAdmin && <div style={{ fontSize: 12, color: "#888" }}>{formatDoc(user?.doc || "")}</div>}
        </div>
        <button style={s.btn} onClick={logout}>Sair</button>
      </div>

      {msg && <div style={{ marginBottom: 12, padding: "8px 14px", borderRadius: 8, background: msg.err ? "#fff0f0" : "#f0fff4", color: msg.err ? "#c00" : "#2d7a4f", fontSize: 13 }}>{msg.text}</div>}

      {!isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.5rem" }}>
          {[["Seus pontos", meusPts], ["Posição", meuRank > 0 ? `${meuRank}º` : "—"]].map(([l, v]) => (
            <div key={l} style={{ background: "#f9f9f9", borderRadius: 8, padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={s.nav}>
        {isAdmin ? (
          [["admin","Início"],["clientes","Clientes"],["resultados","Resultados"],["ranking","Ranking"]].map(([t, l]) => (
            <button key={t} style={s.navB(tela === t)} onClick={async () => {
              setTela(t);
              if (t === "clientes") await carregarClientes();
              if (t === "resultados") await carregarJogos();
              if (t === "ranking") { await carregarJogos(); await carregarClientes(); await carregarTodosPalpites(); }
            }}>{l}</button>
          ))
        ) : (
          [["jogos","Palpites"],["ranking","Ranking"]].map(([t, l]) => (
            <button key={t} style={s.navB(tela === t)} onClick={async () => {
              setTela(t);
              if (t === "ranking") { await carregarClientes(); await carregarTodosPalpites(); }
            }}>{l}</button>
          ))
        )}
      </div>

      {tela === "admin" && <div style={s.card}><p style={{ margin: 0, fontSize: 14, color: "#555" }}>Use o menu acima para gerenciar clientes, inserir resultados e acompanhar o ranking.</p></div>}

      {tela === "clientes" && <AdminClientes clientes={clientes} onAdd={addCliente} onToggle={toggleCliente} s={s} />}

      {tela === "resultados" && jogos.map(j => (
        <div key={j.id} style={s.card}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Grupo {j.grupo} · {formatData(j.data_hora)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 500, flex: 1 }}>{j.time1}</span>
            <ResultInput jogo={j} onSalvar={salvarResultado} s={s} />
            <span style={{ fontWeight: 500, flex: 1, textAlign: "right" }}>{j.time2}</span>
          </div>
        </div>
      ))}

      {tela === "ranking" && (
        <div>
          {ranking.length === 0 && <p style={{ fontSize: 14, color: "#888" }}>Nenhum palpite ainda.</p>}
          {ranking.map((c, i) => (
            <div key={c.id} style={{ ...s.card, borderColor: c.id === user?.id ? "#1D9E75" : "#eee", borderWidth: c.id === user?.id ? 2 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, minWidth: 28 }}>{["🥇","🥈","🥉"][i] || `${i+1}º`}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{c.nome}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{c.acertos} placar(es) exato(s)</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 500, fontSize: 18 }}>{c.pts}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>pts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tela === "jogos" && jogos.map(j => {
        const p = palpites.find(x => x.jogo_id === j.id);
        const passou = new Date(j.data_hora) < new Date();
        const pts = p && j.resultado_g1 != null ? calcPontos(p.g1, p.g2, j.resultado_g1, j.resultado_g2) : null;
        return (
          <div key={j.id} style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#888" }}>Grupo {j.grupo} · {formatData(j.data_hora)}</span>
              {pts !== null && <span style={s.tag(pts)}>{pts === 3 ? "Placar exato +3" : pts === 1 ? "Vencedor +1" : "Errou"}</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{j.time1}</span>
              {passou || j.encerrado ? (
                <div style={{ textAlign: "center" }}>
                  {j.encerrado && <div style={{ fontSize: 13, color: "#888" }}>Resultado: {j.resultado_g1}×{j.resultado_g2}</div>}
                  {p ? <div style={{ fontSize: 13 }}>Seu palpite: {p.g1}×{p.g2}</div> : <div style={{ fontSize: 13, color: "#aaa" }}>Sem palpite</div>}
                </div>
              ) : (
                <PalpiteInput jogoId={j.id} palpiteAtual={p} onSalvar={salvarPalpite} s={s} />
              )}
              <span style={{ fontWeight: 500, fontSize: 15 }}>{j.time2}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminClientes({ clientes, onAdd, onToggle, s }) {
  const [doc, setDoc] = useState(""); const [nome, setNome] = useState(""); const [senha, setSenha] = useState("");
  return (
    <div>
      <div style={s.card}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Novo cliente</div>
        <div style={{ display: "grid", gap: 8 }}>
          <input style={s.inp} placeholder="CPF ou CNPJ (só números)" value={doc} onChange={e => setDoc(e.target.value)} />
          <input style={s.inp} placeholder="Nome / Razão social" value={nome} onChange={e => setNome(e.target.value)} />
          <input style={s.inp} placeholder="Senha inicial" value={senha} onChange={e => setSenha(e.target.value)} />
          <button style={s.btnP} onClick={async () => { await onAdd(doc, nome, senha); setDoc(""); setNome(""); setSenha(""); }}>Adicionar</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{clientes.filter(c => c.doc !== "admin" && c.ativo).length} clientes ativos</div>
      {clientes.filter(c => c.doc !== "admin").map(c => (
        <div key={c.id} style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, opacity: c.ativo ? 1 : 0.5 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{c.nome}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{formatDoc(c.doc)}</div>
          </div>
          <button style={{ ...s.btn, fontSize: 12 }} onClick={() => onToggle(c.id, c.ativo)}>{c.ativo ? "Desativar" : "Ativar"}</button>
        </div>
      ))}
    </div>
  );
}

function ResultInput({ jogo, onSalvar, s }) {
  const [g1, setG1] = useState(jogo.resultado_g1 ?? ""); const [g2, setG2] = useState(jogo.resultado_g2 ?? "");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input style={s.num} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#888" }}>×</span>
        <input style={s.num} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button style={{ ...s.btnP, fontSize: 12, padding: "4px 12px" }} onClick={() => onSalvar(jogo.id, g1, g2)}>
        {jogo.encerrado ? "Atualizar" : "Confirmar"}
      </button>
      {jogo.encerrado && <span style={{ fontSize: 11, color: "#2d7a4f" }}>Salvo: {jogo.resultado_g1}×{jogo.resultado_g2}</span>}
    </div>
  );
}

function PalpiteInput({ jogoId, palpiteAtual, onSalvar, s }) {
  const [g1, setG1] = useState(palpiteAtual?.g1 ?? ""); const [g2, setG2] = useState(palpiteAtual?.g2 ?? "");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input style={s.num} type="number" min={0} max={20} value={g1} onChange={e => setG1(e.target.value)} />
        <span style={{ color: "#888" }}>×</span>
        <input style={s.num} type="number" min={0} max={20} value={g2} onChange={e => setG2(e.target.value)} />
      </div>
      <button style={{ ...s.btnP, fontSize: 12, padding: "4px 12px", background: palpiteAtual ? "#0F6E56" : "#1D9E75" }}
        onClick={() => onSalvar(jogoId, g1, g2)} disabled={g1 === "" || g2 === ""}>
        {palpiteAtual ? "Atualizar" : "Salvar palpite"}
      </button>
    </div>
  );
}
