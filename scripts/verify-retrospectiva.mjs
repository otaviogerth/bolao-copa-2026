import assert from "node:assert/strict";
import { calcPontos, calcRankingAcumulado, calcLinhaDoTempoLideranca } from "../app/retrospectiva.mjs";

const clientes = [
  { id: 1, nome: "Ana", doc: "111", tipo: "funcionario", ativo: true },
  { id: 2, nome: "Bruno", doc: "222", tipo: "funcionario", ativo: true },
];

const jogos = [
  { id: 10, time1: "Brasil", time2: "Argentina", grupo: "A", fase: "grupos", data_hora: "2026-06-11T13:00:00Z", resultado_g1: 2, resultado_g2: 1, encerrado: true },
  { id: 11, time1: "França", time2: "Alemanha", grupo: "B", fase: "grupos", data_hora: "2026-06-12T13:00:00Z", resultado_g1: 0, resultado_g2: 0, encerrado: true },
];

const palpites = [
  { id: 100, cliente_id: 1, jogo_id: 10, g1: 2, g2: 1 }, // Ana: exato no Brasil x Argentina
  { id: 101, cliente_id: 1, jogo_id: 11, g1: 1, g2: 0 }, // Ana: errou (previu vitória, saiu empate)
  { id: 102, cliente_id: 2, jogo_id: 10, g1: 1, g2: 0 }, // Bruno: acertou só o vencedor
  { id: 103, cliente_id: 2, jogo_id: 11, g1: 0, g2: 0 }, // Bruno: exato no França x Alemanha
];

// calcPontos: multiplicador dobra pra Brasil, dobra de novo pra mata-mata
assert.equal(calcPontos(2, 1, 2, 1, true, false), 20);
assert.equal(calcPontos(2, 1, 2, 1, true, true), 40);
assert.equal(calcPontos(1, 0, 2, 1, false, false), 5);
assert.equal(calcPontos(0, 0, 2, 1, false, false), 0);
assert.equal(calcPontos(1, 1, null, null, false, false), null);

// calcRankingAcumulado: Ana e Bruno empatam em pontos, Ana vence no desempate (acertosBrasil)
const ranking = calcRankingAcumulado(jogos, palpites, clientes);
assert.equal(ranking[0].id, 1);
assert.equal(ranking[0].pts, 20);
assert.equal(ranking[0].acertos, 1);
assert.equal(ranking[0].acertosBrasil, 1);
assert.equal(ranking[1].id, 2);
assert.equal(ranking[1].pts, 20);
assert.equal(ranking[1].acertosBrasil, 0);

console.log("OK: calcPontos + calcRankingAcumulado");

// calcLinhaDoTempoLideranca: só 2 jogos decididos -> 1 periodo, sem trocas
const linha = calcLinhaDoTempoLideranca(jogos, palpites, clientes);
assert.equal(linha.trocas, 0);
assert.equal(linha.diasLideranca.length, 1);
assert.equal(linha.diasLideranca[0].id, 1);
assert.equal(linha.diasLideranca[0].dias, 1);
assert.deepEqual(linha.top4, linha.diasLideranca);
assert.equal(linha.melhorPosicaoPorId[1], 1);
assert.equal(linha.melhorPosicaoPorId[2], 2);

// sem jogos decididos o suficiente -> sem lideranca calculavel
const linhaVazia = calcLinhaDoTempoLideranca([jogos[0]], palpites, clientes);
assert.equal(linhaVazia.trocas, 0);
assert.deepEqual(linhaVazia.diasLideranca, []);

console.log("OK: calcLinhaDoTempoLideranca");
