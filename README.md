# desafio_teste_campo_minado

Lógica do jogo **Campo Minado** (tabuleiro 18 x 14 com 40 minas) em JavaScript, coberta por casos de teste automatizados com Jest.

## Colaborador

- Gustavo de Almeida Gomes (24000271-2)

## Especificação do desafio

Enunciado do professor, especificação proposta por Laura:

> **Campo minado (by Laura)**
> casos de teste para testar campo minado de tabuleiro 18 x 14 com 40 bombas;
> casos de teste em Javascript para testar Javascript;

O que foi entregue:

- a lógica do jogo em JavaScript (Node.js, CommonJS), **sem interface**, porque o foco do desafio são os testes;
- os casos de teste em JavaScript, com [Jest](https://jestjs.io/), cobrindo 100% das linhas, branches e funções de `src/`.

## Regras implementadas

O enunciado define só o tamanho do tabuleiro e o número de minas. As demais regras seguem o Campo Minado clássico. Os pontos marcados como **decisão adotada** são casos ambíguos ou variantes: as propostas foram apresentadas e, sem objeção, foram mantidas.

### Tabuleiro

- **Decisão adotada:** "18 x 14" quer dizer **18 colunas por 14 linhas**, ou seja, 252 células, das quais 212 ficam sem mina.
- O tabuleiro tem sempre **40 minas**, nunca duas na mesma célula.
- As posições são `{ linha, coluna }` e começam em zero: as linhas vão de 0 a 13 e as colunas de 0 a 17.
- Cada célula tem até **8 vizinhas**, contando as diagonais. Nas bordas são 5 e nos cantos são 3.
- O número de uma célula revelada é a quantidade de minas entre as vizinhas dela.

### Primeiro clique

- **Decisão adotada:** as minas só são sorteadas **no primeiro clique**, e **nunca caem na área 3 x 3** formada pela célula clicada e pelas vizinhas dela. Por isso o primeiro clique nunca perde e sempre abre uma área.
- O sorteio usa o embaralhamento de Fisher-Yates sobre as posições permitidas e fica com as 40 primeiras.

### Revelar

- Revelar uma mina encerra a partida com **derrota**.
- Revelar uma célula sem minas vizinhas abre as vizinhas automaticamente, **em cascata**. Uma célula com minas vizinhas abre só a si mesma.
- **Decisão adotada:** a cascata **não abre células com bandeira**.
- **Decisão adotada:** revelar uma célula com bandeira, ou uma célula já revelada, é proibido e lança `ErroDeRegra`.
- **Decisão adotada:** não há *chording*, que seria clicar num número para abrir as vizinhas.

### Bandeiras

- `alternarBandeira` marca uma célula oculta e, chamado de novo, desmarca.
- Marcar bandeira numa célula revelada é proibido e lança `ErroDeRegra`.
- **Decisão adotada:** **não há limite de bandeiras.** O contador de minas restantes é 40 menos o número de bandeiras e pode ficar negativo, como no jogo clássico.
- **Decisão adotada:** não existe a marca de interrogação (?).
- Bandeiras podem ser colocadas antes do primeiro clique.

### Fim de jogo

- **Vitória:** todas as 212 células sem mina estão reveladas. **Decisão adotada:** bandeiras não são exigidas.
- **Derrota:** uma mina foi revelada.
- **Decisão adotada:** depois do fim, a posição de todas as minas fica visível, inclusive das que tinham bandeira. Bandeiras em células sem mina continuam aparecendo como bandeira.
- Depois do fim, `revelar` e `alternarBandeira` lançam `ErroDeRegra('A partida já terminou.')`. `consultarCelula` continua disponível.
- **Decisão adotada:** cronômetro e placar ficam fora do escopo, porque não há interface.

### Argumentos inválidos

- Uma posição sem `linha` e `coluna` inteiras lança `TypeError`.
- Uma posição fora do tabuleiro lança `RangeError`.
- Um gerador de minas que não é função lança `TypeError`.
- Um gerador de minas que devolve outra quantidade que não 40, minas repetidas, minas fora do tabuleiro ou minas na área do primeiro clique lança `RangeError`. Nesse caso a partida **não muda de estado**.
- Um gerador de números aleatórios que devolve valor fora de `[0, 1)` lança `RangeError`.

## Estrutura de pastas

```
desafio_teste_campo_minado/
├── src/
│   ├── constantes.js            dimensões do tabuleiro (14 x 18), total de minas e de células
│   ├── erros.js                 ErroDeRegra, para violações das regras do jogo
│   ├── posicao.js               validação de posição, vizinhança, área 3 x 3 e lista de posições
│   ├── sorteioDasMinas.js       embaralhamento e sorteio das 40 minas com aleatoriedade injetada
│   ├── tabuleiro.js             onde estão as minas e quantas há em volta de cada célula
│   └── partida.js               estado do jogo: revelar, cascata, bandeiras, vitória e derrota
├── tests/
│   ├── helpers/
│   │   ├── geradoresDeNumeros.js   geradores de números "aleatórios" previsíveis
│   │   ├── posicoes.js             posicoesDaLinha, atalho para montar fixtures
│   │   └── tabuleiros.js           tabuleiros de 40 minas montados à mão
│   ├── constantes.test.js
│   ├── erros.test.js
│   ├── posicao.test.js
│   ├── sorteioDasMinas.test.js
│   ├── tabuleiro.test.js
│   └── partida.test.js
├── .gitignore
├── package.json
└── README.md
```

## Como rodar

Requer Node.js; foi desenvolvido no Node 26.1.0. O Jest 30.5.2 é a única dependência de desenvolvimento.

```bash
npm install
npm test
npm run test:coverage
```

Resultado atual:

```
Test Suites: 6 passed, 6 total
Tests:       129 passed, 129 total

File                | % Stmts | % Branch | % Funcs | % Lines
All files           |     100 |      100 |     100 |     100
```

## Como funcionam os casos de teste

### Determinismo: nenhuma aleatoriedade fica sem controle

O jogo é aleatório, mas os testes não podem ser. Toda aleatoriedade é **injetada**:

- `sortearMinas(primeiroClique, gerarNumeroAleatorio = Math.random)` recebe a fonte de números aleatórios.
- `new Partida(gerarMinas = sortearMinas)` recebe a função que gera as minas a partir do primeiro clique.

Em produção valem os padrões (`Math.random` e o sorteio real). Nos testes entram cenários montados à mão, em `tests/helpers/`, com nomes que dizem o resultado esperado:

| Cenário | Onde estão as 40 minas | Para que serve |
|---|---|---|
| `MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE` | linhas 12 e 13 inteiras, mais as colunas 14 a 17 da linha 11 | a cascata do primeiro clique abre todas as 212 células e a partida termina em vitória |
| `MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO` | (0,1), (1,0), (1,1), (11,17) e as linhas 12 e 13 inteiras | o canto (0,0) não tem mina mas fica isolado. Depois do primeiro clique em (5,9), 211 células abrem e a partida continua: revelar (0,0) dá vitória, revelar (0,1) dá derrota |
| `MINAS_QUE_CERCAM_A_CELULA_6_8` | as 8 vizinhas de (6,8), mais as colunas 0 a 15 das linhas 12 e 13 | contagem de minas vizinhas de 0 a 8, incluindo bordas e cantos |
| `GERADOR_QUE_MANTEM_A_ORDEM` | é um gerador de números: sempre devolve quase 1 | o embaralhamento não troca nada e as minas são as 40 primeiras posições permitidas |
| `GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO` | é um gerador de números: sempre devolve 0 | o resultado do embaralhamento é conhecido de antemão |
| `criarGeradorEmSequencia([...])` | é um gerador de números: devolve a lista em ciclo | o mesmo gerador sempre produz o mesmo tabuleiro |

Os tabuleiros-fixture são congelados com `Object.freeze`, para que nenhum teste altere um cenário usado por outro.

Também foram usados:

- `test.each` nas tabelas de regras, como posições válidas e inválidas, contagem de minas vizinhas e ações recusadas depois da vitória ou da derrota;
- `jest.fn` para provar que as minas só são geradas no primeiro clique, uma única vez.

### Duas categorias de erro

| Erro | Quando | Exemplo |
|---|---|---|
| `ErroDeRegra` (estende `Error`) | o jogador tenta uma jogada que as regras proíbem | revelar uma célula com bandeira, revelar de novo, marcar bandeira numa célula revelada, agir depois do fim |
| `TypeError` / `RangeError` | quem chama passa um argumento inválido | posição que não é inteira, posição fora do tabuleiro, gerador que não é função ou que devolve minas inválidas |

Os testes conferem a classe e a mensagem de cada `ErroDeRegra`, com `toThrow(new ErroDeRegra('...'))`. Também conferem que a validação acontece **antes** de qualquer mudança de estado: depois de uma ação recusada, a partida continua exatamente como estava.

### Arquivos de teste

| Arquivo | Nº de testes | O que verifica |
|---|---|---|
| `tests/erros.test.js` | 1 | `ErroDeRegra` é um `Error` com nome e mensagem próprios |
| `tests/constantes.test.js` | 4 | tabuleiro de 14 x 18, 40 minas, 252 células (212 sem mina) e espaço para as minas fora da área do primeiro clique |
| `tests/posicao.test.js` | 32 | posições válidas, `TypeError` e `RangeError`, vizinhas no meio, nas bordas e nos cantos, área 3 x 3 e lista de todas as posições |
| `tests/sorteioDasMinas.test.js` | 19 | Fisher-Yates com geradores previsíveis, 40 minas sem repetição, área do primeiro clique livre, reprodutibilidade, uso de `Math.random` por padrão e rejeição de números fora de `[0, 1)` |
| `tests/tabuleiro.test.js` | 25 | validade dos fixtures, `temMina`, contagem de 0 a 8 minas vizinhas e rejeição de listas inválidas, com quantidade errada, repetição ou posição inválida |
| `tests/partida.test.js` | 48 | início, primeiro clique seguro, cascata (inclusive parando em bandeiras), números revelados, bandeiras e contador negativo, vitória, derrota, nada aceito depois do fim, argumentos inválidos e encapsulamento |
| **Total** | **129** | **6 suítes, 100% de cobertura** |
