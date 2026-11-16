function posicoesDaLinha(linha, colunaInicial, colunaFinal) {
  const posicoes = [];
  for (let coluna = colunaInicial; coluna <= colunaFinal; coluna++) {
    posicoes.push({ linha, coluna });
  }
  return posicoes;
}

module.exports = { posicoesDaLinha };
