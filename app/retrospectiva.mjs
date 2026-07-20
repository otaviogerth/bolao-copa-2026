export const FASES_MATA = ["16avos","oitavas","quartas","semis","terceiro","final"];

export function calcPontos(g1, g2, rg1, rg2, isBrasil = false, isMataMata = false) {
  if (rg1 == null || rg2 == null) return null;
  const mult = (isBrasil ? 2 : 1) * (isMataMata ? 2 : 1);
  if (g1 === rg1 && g2 === rg2) return 10 * mult;
  const v = (a, b) => a > b ? 1 : b > a ? 2 : 0;
  return v(g1, g2) === v(rg1, rg2) ? 5 * mult : 0;
}

export function calcRankingAcumulado(jogosConsiderados, todosPalpites, clientesElegiveis) {
  return clientesElegiveis.map(c => {
    let pts = 0, acertos = 0, acertosBrasil = 0, acertosExatoVencedor = 0;
    jogosConsiderados.forEach(j => {
      const p = todosPalpites.find(x => x.cliente_id === c.id && x.jogo_id === j.id);
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
