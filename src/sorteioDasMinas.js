const { TOTAL_DE_MINAS } = require('./constantes');
const { validarPosicao, estaNaAreaAoRedor, todasAsPosicoes } = require('./posicao');

function sortearIndice(quantidadeDeOpcoes, gerarNumeroAleatorio) {
  const numeroAleatorio = gerarNumeroAleatorio();
  if (!(numeroAleatorio >= 0 && numeroAleatorio < 1)) {
    throw new RangeError(
      `O gerador de números aleatórios deve devolver um valor em [0, 1); devolveu ${numeroAleatorio}.`,
    );
  }
  return Math.floor(numeroAleatorio * quantidadeDeOpcoes);
}

function embaralhar(itens, gerarNumeroAleatorio) {
  const embaralhados = [...itens];
  for (let indiceAtual = embaralhados.length - 1; indiceAtual > 0; indiceAtual--) {
    const indiceSorteado = sortearIndice(indiceAtual + 1, gerarNumeroAleatorio);
    [embaralhados[indiceAtual], embaralhados[indiceSorteado]] = [
      embaralhados[indiceSorteado],
      embaralhados[indiceAtual],
    ];
  }
  return embaralhados;
}

function sortearMinas(primeiroClique, gerarNumeroAleatorio = Math.random) {
  validarPosicao(primeiroClique);
  const posicoesPermitidas = todasAsPosicoes().filter(
    (posicao) => !estaNaAreaAoRedor(posicao, primeiroClique),
  );
  return embaralhar(posicoesPermitidas, gerarNumeroAleatorio).slice(0, TOTAL_DE_MINAS);
}

module.exports = { embaralhar, sortearMinas };
