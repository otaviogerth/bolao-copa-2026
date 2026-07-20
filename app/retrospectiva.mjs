export const FASES_MATA = ["16avos","oitavas","quartas","semis","terceiro","final"];

export function calcPontos(g1, g2, rg1, rg2, isBrasil = false, isMataMata = false) {
  if (rg1 == null || rg2 == null) return null;
  const mult = (isBrasil ? 2 : 1) * (isMataMata ? 2 : 1);
  if (g1 === rg1 && g2 === rg2) return 10 * mult;
  const v = (a, b) => a > b ? 1 : b > a ? 2 : 0;
  return v(g1, g2) === v(rg1, rg2) ? 5 * mult : 0;
}

export function calcRankingAcumulado(jogosConsiderados, todosPalpites, clientesElegiveis) {
  const palpitesPorChave = new Map();
  todosPalpites.forEach(p => palpitesPorChave.set(`${p.cliente_id}_${p.jogo_id}`, p));

  return clientesElegiveis.map(c => {
    let pts = 0, acertos = 0, acertosBrasil = 0, acertosExatoVencedor = 0;
    jogosConsiderados.forEach(j => {
      const p = palpitesPorChave.get(`${c.id}_${j.id}`);
      if (!p || j.resultado_g1 == null || j.resultado_g2 == null) return;
      const isBrasil = j.time1 === "Brasil" || j.time2 === "Brasil";
      const isMataMata = FASES_MATA.includes(j.fase);
      const pp = calcPontos(p.g1, p.g2, j.resultado_g1, j.resultado_g2, isBrasil, isMataMata);
      pts += pp;
      const isExact = p.g1 === j.resultado_g1 && p.g2 === j.resultado_g2;
      if (isExact) acertos++;
      if (isExact && isBrasil) acertosBrasil++;
      if (isExact && j.resultado_g1 !== j.resultado_g2) acertosExatoVencedor++;
    });
    return { ...c, pts, acertos, acertosBrasil, acertosExatoVencedor };
  }).sort((a, b) =>
    b.pts - a.pts ||
    b.acertosBrasil - a.acertosBrasil ||
    b.acertosExatoVencedor - a.acertosExatoVencedor ||
    a.id - b.id
  );
}

export function calcLinhaDoTempoLideranca(jogos, todosPalpites, clientesElegiveis) {
  const decididos = jogos
    .filter(j => j.resultado_g1 != null && j.resultado_g2 != null)
    .slice()
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

  const diasLiderancaPorId = new Map();
  const melhorPosicaoPorId = new Map();
  let trocas = 0;
  let liderAnterior = null;

  if (decididos.length >= 2 && clientesElegiveis.length > 0) {
    for (let i = 1; i < decididos.length; i++) {
      const consideradosAteAqui = decididos.slice(0, i + 1);
      const rankingAqui = calcRankingAcumulado(consideradosAteAqui, todosPalpites, clientesElegiveis);

      rankingAqui.forEach((c, idx) => {
        const rank = idx + 1;
        const atual = melhorPosicaoPorId.get(c.id);
        if (atual === undefined || rank < atual) melhorPosicaoPorId.set(c.id, rank);
      });

      const lider = rankingAqui[0];
      if (liderAnterior !== null && lider.id !== liderAnterior) trocas++;
      liderAnterior = lider.id;

      const inicio = new Date(decididos[i].data_hora).getTime();
      // ultimo periodo nao tem "proximo jogo" pra marcar o fim: soma 1 dia simbolico pro dia da final
      const fim = i + 1 < decididos.length
        ? new Date(decididos[i + 1].data_hora).getTime()
        : inicio + 24 * 60 * 60 * 1000;
      const dias = Math.max(0, (fim - inicio) / (24 * 60 * 60 * 1000));

      diasLiderancaPorId.set(lider.id, (diasLiderancaPorId.get(lider.id) || 0) + dias);
    }
  }

  const nomesPorId = new Map(clientesElegiveis.map(c => [c.id, c.nome]));
  const diasLideranca = [...diasLiderancaPorId.entries()]
    .map(([id, dias]) => ({ id, nome: nomesPorId.get(id), dias: Math.round(dias) }))
    .sort((a, b) => b.dias - a.dias || a.id - b.id);

  return {
    trocas,
    diasLideranca,
    top4: diasLideranca.slice(0, 4),
    melhorPosicaoPorId: Object.fromEntries(melhorPosicaoPorId),
  };
}

export function calcRetrospectivaUsuario(clienteId, jogos, todosPalpites, clientesElegiveisIds = null) {
  const elegiveisSet = clientesElegiveisIds ? new Set([...clientesElegiveisIds, clienteId]) : null;
  const meusPalpites = todosPalpites.filter(p => p.cliente_id === clienteId);

  let placarDaSorte = null;
  if (meusPalpites.length > 0) {
    const contagem = new Map();
    meusPalpites.forEach(p => {
      const chave = `${p.g1}-${p.g2}`;
      contagem.set(chave, (contagem.get(chave) || 0) + 1);
    });
    let melhorChave = null, melhorVezes = 0;
    for (const [chave, vezes] of contagem) {
      if (vezes > melhorVezes) { melhorChave = chave; melhorVezes = vezes; }
    }
    if (melhorChave) {
      const [g1, g2] = melhorChave.split("-").map(Number);
      placarDaSorte = { g1, g2, vezes: melhorVezes };
    }
  }

  const decididosOrdenados = jogos
    .filter(j => j.resultado_g1 != null && j.resultado_g2 != null)
    .slice()
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

  let acertos = 0;
  let sequenciaAtual = 0;
  let melhorSequencia = 0;
  const statsPorTime = new Map();
  const acertosLendarios = [];

  decididosOrdenados.forEach(j => {
    const p = meusPalpites.find(x => x.jogo_id === j.id);
    const isBrasil = j.time1 === "Brasil" || j.time2 === "Brasil";
    const isMataMata = FASES_MATA.includes(j.fase);

    if (!p) { sequenciaAtual = 0; return; }

    const pontos = calcPontos(p.g1, p.g2, j.resultado_g1, j.resultado_g2, isBrasil, isMataMata);
    const isExato = p.g1 === j.resultado_g1 && p.g2 === j.resultado_g2;
    if (isExato) acertos++;

    [j.time1, j.time2].forEach(time => {
      const s = statsPorTime.get(time) || { tentativas: 0, acertos: 0 };
      s.tentativas++;
      if (isExato) s.acertos++;
      statsPorTime.set(time, s);
    });

    if (pontos > 0) { sequenciaAtual++; melhorSequencia = Math.max(melhorSequencia, sequenciaAtual); }
    else { sequenciaAtual = 0; }

    if (isExato) {
      const todosDoJogo = todosPalpites.filter(x => x.jogo_id === j.id && (!elegiveisSet || elegiveisSet.has(x.cliente_id)));
      const acertantes = todosDoJogo.filter(x => x.g1 === j.resultado_g1 && x.g2 === j.resultado_g2);
      if (acertantes.length === 1) {
        acertosLendarios.push({ jogoId: j.id, time1: j.time1, time2: j.time2, g1: j.resultado_g1, g2: j.resultado_g2, dataHora: j.data_hora });
      }
    }
  });

  let selecaoDaSorte = null, selecaoAzarada = null;
  const times = [...statsPorTime.entries()].map(([time, s]) => ({ time, ...s }));
  if (times.length > 0) {
    const porMelhor = times.slice().sort((a, b) =>
      b.acertos - a.acertos || b.tentativas - a.tentativas || a.time.localeCompare(b.time)
    );
    if (porMelhor[0].acertos > 0) selecaoDaSorte = porMelhor[0];

    const porPior = times.slice().sort((a, b) =>
      a.acertos - b.acertos || b.tentativas - a.tentativas || a.time.localeCompare(b.time)
    );
    const candidataAzarada = porPior[0];
    if (times.length > 1 && (!selecaoDaSorte || candidataAzarada.time !== selecaoDaSorte.time)) {
      selecaoAzarada = candidataAzarada;
    }
  }

  return {
    placarDaSorte,
    acertos,
    totalApostas: meusPalpites.length,
    melhorSequencia,
    selecaoDaSorte,
    selecaoAzarada,
    acertosLendarios,
  };
}
