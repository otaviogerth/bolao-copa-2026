# Retrospectiva da Copa 2026 (estilo Spotify Wrapped)

## Objetivo

Depois do fim da Copa, cada funcionário pode abrir uma tela de "retrospectiva" pessoal, em formato de stories, com estatísticas divertidas sobre seus palpites e a disputa do bolão. O admin também pode abrir a retrospectiva de qualquer funcionário.

## Escopo

- Tudo client-side, dentro de `app/page.js`, seguindo o mesmo padrão do `ranking` (useMemo sobre `jogos` + `todosPalpites` + `clientes`, já carregados hoje).
- Sem tabela nova, sem script de build, sem edge function.
- Sem compartilhamento externo (não gera imagem/link pra postar).
- Escopo de usuários: mesmo escopo do ranking atual — `clientes` com `tipo==="funcionario"` e `ativo===true`.

## Acesso

- Funcionário: botão na tela principal (`jogos`/`matamata`), ex. "Sua Retrospectiva 2026", abre `tela==="retrospectiva"` com os próprios dados.
- Admin: botão por linha na tela `clientes`, abre a retrospectiva daquele funcionário específico.

## Cálculo das métricas

### Por usuário

- **Placar da sorte**: par (g1,g2) que mais se repete entre os palpites do usuário (contando todos os palpites, não só os de jogos já encerrados). Empate: qualquer um dos empatados, escolha determinística (primeiro na ordem de iteração).
- **Palpites certos (exatos)**: quantidade de jogos encerrados em que o usuário cravou o placar exato — já existe como `acertos` no cálculo do ranking.
- **Seleção da sorte**: dentre os jogos encerrados em que o usuário apostou em um time (esse time jogando), o time em que ele mais cravou o placar exato. Se zero acertos exatos no total, esse slide é pulado.
- **Seleção azarada**: dentre os times em que o usuário apostou pelo menos uma vez, o time com pior taxa de acerto exato (menos acertos; empate desfeito por mais tentativas = pior). Pulado se coincidir com a seleção da sorte ou se não houver dado suficiente (ex. só uma seleção com aposta).
- **Melhor sequência pontuando**: maior sequência de jogos consecutivos (em ordem cronológica por `data_hora`, considerando só jogos encerrados) em que o usuário fez algum ponto (>0, exato ou só resultado). A sequência zera se o usuário errar o jogo ou não tiver palpite nele.
- **Acerto lendário**: lista de jogos em que, entre todos os participantes (`todosPalpites` no escopo do ranking) daquele jogo, o usuário foi o ÚNICO a cravar o placar exato. Pode ter mais de um; se tiver mais de um, mostra o mais notável (ex. mata-mata ou Brasil primeiro) ou todos empilhados no mesmo slide. Slide pulado se a lista for vazia.
- **Melhor posição alcançada** e **dias em 1º lugar**: ver seção "Linha do tempo de liderança" abaixo.

### Linha do tempo de liderança (compartilhada entre todos os usuários)

1. Filtrar jogos com resultado preenchido (`resultado_g1`/`resultado_g2` não nulos), ordenar por `data_hora` crescente.
2. Para cada jogo dessa lista, recalcular o ranking acumulado até aquele ponto (mesmos pontos e mesmo desempate do ranking atual: `pts` desc → `acertosBrasil` desc → `acertosExatoVencedor` desc → `id` asc) e identificar o líder (1º colocado).
3. Descartar o líder do 1º jogo decidido da lista (todo mundo empatado em 0 pts nesse momento — não é liderança real, só desempate arbitrário por id).
4. A partir do 2º jogo decidido, cada trecho entre a `data_hora` de um jogo e a do próximo (ou o fim, no último jogo) vira um "período" atribuído ao líder daquele momento.
5. **Trocas de liderança** (métrica global): quantas vezes o líder muda de um período pro seguinte.
6. **Dias por pessoa**: soma, em dias, da duração dos períodos em que essa pessoa foi líder.
7. **Top 4 em dias de liderança** (métrica global): as 4 pessoas com mais dias somados, com a contagem de cada uma.
8. **Melhor posição do usuário**: menor rank (1-based) que ele atingiu em qualquer período da linha do tempo.
9. **Dias em 1º lugar do usuário**: dias somados em que ele foi especificamente o líder (rank 1).

Essa reconstrução usa `data_hora` do jogo como proxy de "quando a liderança mudou" — é uma aproximação (não é a hora real em que o admin lançou o resultado), aceita como suficiente pro propósito da retrospectiva.

## UI — stories em tela cheia

Componente novo `RetrospectivaView`. Full-screen, fundo escuro com gradiente (reaproveitando `RED`/`YELLOW`/`DARK`/`FD` já usados no app). Barra de progresso no topo (estilo Instagram Stories) com um segmento por slide visível (slides pulados não geram segmento). Navegação por toque: lateral direita avança, lateral esquerda volta. Sem gestos de swipe.

Ordem dos slides (slides marcados como condicionais são pulados quando não há dado):
1. Abertura — nome do usuário, "Sua Retrospectiva da Copa 2026"
2. Posição final no ranking + pontos totais
3. Quantos palpites exatos acertou (de quantos jogos apostou no total)
4. Placar da sorte
5. Seleção da sorte *(condicional: pula se zero acertos exatos)*
6. Seleção azarada *(condicional: pula se coincidir com a da sorte ou não houver dado)*
7. Melhor sequência pontuando
8. Melhor posição alcançada + dias em 1º lugar *(condicional: pula se o usuário nunca liderou)*
9. Acerto lendário *(condicional: só aparece se houver ao menos um)*
10. Fechamento coletivo — trocas de liderança do bolão + Top 4 em dias de liderança (idêntico pra todo mundo)
11. Slide final de encerramento

## Fora de escopo

- Compartilhamento/exportação de imagem.
- Registro de snapshots reais de liderança daqui pra frente (a copa já acabou; se quiser isso pra próximas edições, é um projeto separado).
- Retrospectiva para usuários `tipo!=="funcionario"` ou inativos (fora do escopo do ranking atual).
