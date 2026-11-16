const { TOTAL_DE_MINAS } = require('./constantes');
const { validarPosicao, posicoesVizinhas, chaveDaPosicao } = require('./posicao');

function validarPosicoesDasMinas(posicoesDasMinas) {
  if (!Array.isArray(posicoesDasMinas)) {
    throw new TypeError('As posições das minas devem ser informadas em uma lista.');
  }
  if (posicoesDasMinas.length !== TOTAL_DE_MINAS) {
    throw new RangeError(
      `O tabuleiro deve ter exatamente ${TOTAL_DE_MINAS} minas; recebeu ${posicoesDasMinas.length}.`,
    );
  }
  posicoesDasMinas.forEach((posicao) => validarPosicao(posicao));
  const chavesDistintas = new Set(posicoesDasMinas.map(chaveDaPosicao));
  if (chavesDistintas.size !== posicoesDasMinas.length) {
    throw new RangeError('Há mais de uma mina na mesma posição.');
  }
}

class Tabuleiro {
  #chavesDasMinas;

  constructor(posicoesDasMinas) {
    validarPosicoesDasMinas(posicoesDasMinas);
    this.#chavesDasMinas = new Set(posicoesDasMinas.map(chaveDaPosicao));
  }

  temMina(posicao) {
    validarPosicao(posicao);
    return this.#contemMina(posicao);
  }

  contarMinasVizinhas(posicao) {
    return posicoesVizinhas(posicao).filter((vizinha) => this.#contemMina(vizinha)).length;
  }

  #contemMina(posicao) {
    return this.#chavesDasMinas.has(chaveDaPosicao(posicao));
  }
}

module.exports = { Tabuleiro };
