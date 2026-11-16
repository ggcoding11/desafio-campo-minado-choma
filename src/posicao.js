const { LINHAS, COLUNAS } = require('./constantes');

const DESLOCAMENTOS_DAS_VIZINHAS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

const DISTANCIA_MAXIMA_DA_AREA_AO_REDOR = 1;

function estaDentroDoTabuleiro({ linha, coluna }) {
  return linha >= 0 && linha < LINHAS && coluna >= 0 && coluna < COLUNAS;
}

function validarPosicao(posicao) {
  if (!Number.isInteger(posicao?.linha) || !Number.isInteger(posicao?.coluna)) {
    throw new TypeError('A posição deve ter linha e coluna inteiras.');
  }
  if (!estaDentroDoTabuleiro(posicao)) {
    throw new RangeError(
      `A posição (${posicao.linha}, ${posicao.coluna}) está fora do tabuleiro ${LINHAS} x ${COLUNAS}.`,
    );
  }
}

function posicoesVizinhas(posicao) {
  validarPosicao(posicao);
  return DESLOCAMENTOS_DAS_VIZINHAS
    .map(([deslocamentoDaLinha, deslocamentoDaColuna]) => ({
      linha: posicao.linha + deslocamentoDaLinha,
      coluna: posicao.coluna + deslocamentoDaColuna,
    }))
    .filter(estaDentroDoTabuleiro);
}

function estaNaAreaAoRedor(posicao, centro) {
  return (
    Math.abs(posicao.linha - centro.linha) <= DISTANCIA_MAXIMA_DA_AREA_AO_REDOR &&
    Math.abs(posicao.coluna - centro.coluna) <= DISTANCIA_MAXIMA_DA_AREA_AO_REDOR
  );
}

function todasAsPosicoes() {
  const posicoes = [];
  for (let linha = 0; linha < LINHAS; linha++) {
    for (let coluna = 0; coluna < COLUNAS; coluna++) {
      posicoes.push({ linha, coluna });
    }
  }
  return posicoes;
}

function chaveDaPosicao({ linha, coluna }) {
  return `${linha},${coluna}`;
}

module.exports = {
  validarPosicao,
  posicoesVizinhas,
  estaNaAreaAoRedor,
  todasAsPosicoes,
  chaveDaPosicao,
};
