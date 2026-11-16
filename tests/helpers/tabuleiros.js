const { posicoesDaLinha } = require('./posicoes');

function congelar(posicoes) {
  return Object.freeze(posicoes.map((posicao) => Object.freeze(posicao)));
}

const MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE = congelar([
  ...posicoesDaLinha(11, 14, 17),
  ...posicoesDaLinha(12, 0, 17),
  ...posicoesDaLinha(13, 0, 17),
]);

const MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO = congelar([
  { linha: 0, coluna: 1 },
  { linha: 1, coluna: 0 },
  { linha: 1, coluna: 1 },
  { linha: 11, coluna: 17 },
  ...posicoesDaLinha(12, 0, 17),
  ...posicoesDaLinha(13, 0, 17),
]);

const MINAS_QUE_CERCAM_A_CELULA_6_8 = congelar([
  ...posicoesDaLinha(5, 7, 9),
  { linha: 6, coluna: 7 },
  { linha: 6, coluna: 9 },
  ...posicoesDaLinha(7, 7, 9),
  ...posicoesDaLinha(12, 0, 15),
  ...posicoesDaLinha(13, 0, 15),
]);

module.exports = {
  MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE,
  MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO,
  MINAS_QUE_CERCAM_A_CELULA_6_8,
};
