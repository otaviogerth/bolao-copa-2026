import assert from "node:assert/strict";
import { calcPontos, calcRankingAcumulado, calcLinhaDoTempoLideranca, calcRetrospectivaUsuario } from "../app/retrospectiva.mjs";

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

const retroAna = calcRetrospectivaUsuario(1, jogos, palpites);
assert.deepEqual(retroAna.placarDaSorte, { g1: 2, g2: 1, vezes: 1 });
assert.equal(retroAna.acertos, 1);
assert.equal(retroAna.totalApostas, 2);
assert.equal(retroAna.melhorSequencia, 1);

console.log("OK: calcRetrospectivaUsuario (placar/acertos/sequencia)");

assert.deepEqual(retroAna.selecaoDaSorte, { time: "Argentina", tentativas: 1, acertos: 1 });
assert.deepEqual(retroAna.selecaoAzarada, { time: "Alemanha", tentativas: 1, acertos: 0 });
assert.equal(retroAna.acertosLendarios.length, 1);
assert.equal(retroAna.acertosLendarios[0].jogoId, 10);
assert.equal(retroAna.acertosLendarios[0].time1, "Brasil");
assert.equal(retroAna.acertosLendarios[0].g1, 2);

console.log("OK: calcRetrospectivaUsuario (selecao/lendario)");

// Fix 1: acerto lendario deve ser escopado aos clientes elegiveis do ranking.
// Cenario: um cliente fora do escopo (nao-funcionario ou inativo) tambem cravou
// o mesmo placar exato de Ana no Brasil x Argentina. Como ele nao conta pro
// ranking, o acerto de Ana continua "lendario" (unico ENTRE OS ELEGIVEIS).
const clientesComForaDeEscopo = [
  ...clientes,
  { id: 3, nome: "Cliente Externo", doc: "333", tipo: "cliente", ativo: true },   // fora: tipo != funcionario
  { id: 4, nome: "Ex Funcionario", doc: "444", tipo: "funcionario", ativo: false }, // fora: inativo
];
const palpitesComForaDeEscopo = [
  ...palpites,
  { id: 200, cliente_id: 3, jogo_id: 10, g1: 2, g2: 1 }, // fora de escopo: mesmo placar exato de Ana
  { id: 201, cliente_id: 4, jogo_id: 10, g1: 2, g2: 1 }, // fora de escopo: mesmo placar exato de Ana
];
const clientesElegiveisIds = clientesComForaDeEscopo
  .filter(c => c.doc !== "admin" && c.tipo === "funcionario" && c.ativo)
  .map(c => c.id);

// Sem o escopo (comportamento antigo, sem 4º argumento): acerto deixa de ser lendario
// porque a filtragem enxerga os 2 palpiteiros fora de escopo como "concorrentes".
const retroAnaSemEscopo = calcRetrospectivaUsuario(1, jogos, palpitesComForaDeEscopo);
assert.equal(retroAnaSemEscopo.acertosLendarios.length, 0);

// Com o escopo correto: acerto de Ana continua lendario, pois os 2 "concorrentes"
// nao sao elegiveis pro ranking.
const retroAnaComEscopo = calcRetrospectivaUsuario(1, jogos, palpitesComForaDeEscopo, clientesElegiveisIds);
assert.equal(retroAnaComEscopo.acertosLendarios.length, 1);
assert.equal(retroAnaComEscopo.acertosLendarios[0].jogoId, 10);

console.log("OK: calcRetrospectivaUsuario (acerto lendario escopado aos elegiveis)");
