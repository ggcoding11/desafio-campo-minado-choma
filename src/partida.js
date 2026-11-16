const { TOTAL_DE_MINAS, TOTAL_DE_CELULAS_SEM_MINA } = require('./constantes');
const { ErroDeRegra } = require('./erros');
const {
  validarPosicao,
  posicoesVizinhas,
  estaNaAreaAoRedor,
  chaveDaPosicao,
} = require('./posicao');
const { sortearMinas } = require('./sorteioDasMinas');
const { Tabuleiro } = require('./tabuleiro');

const ESTADO_DA_PARTIDA = Object.freeze({
  EM_ANDAMENTO: 'em andamento',
  VITORIA: 'vitória',
  DERROTA: 'derrota',
});

const CONTEUDO_DA_CELULA = Object.freeze({
  OCULTA: 'oculta',
  BANDEIRA: 'bandeira',
  REVELADA: 'revelada',
  MINA: 'mina',
});

class Partida {
  #gerarMinas;
  #tabuleiro = null;
  #chavesReveladas = new Set();
  #chavesComBandeira = new Set();
  #estado = ESTADO_DA_PARTIDA.EM_ANDAMENTO;

  constructor(gerarMinas = sortearMinas) {
    if (typeof gerarMinas !== 'function') {
      throw new TypeError('O gerador de minas deve ser uma função.');
    }
    this.#gerarMinas = gerarMinas;
  }

  get estado() {
    return this.#estado;
  }

  get minasRestantes() {
    return TOTAL_DE_MINAS - this.#chavesComBandeira.size;
  }

  revelar(posicao) {
    validarPosicao(posicao);
    this.#garantirQueEstaEmAndamento();
    const chave = chaveDaPosicao(posicao);
    if (this.#chavesComBandeira.has(chave)) {
      throw new ErroDeRegra('Não é possível revelar uma célula com bandeira.');
    }
    if (this.#chavesReveladas.has(chave)) {
      throw new ErroDeRegra('Esta célula já foi revelada.');
    }

    if (this.#tabuleiro === null) {
      this.#tabuleiro = this.#criarTabuleiro(posicao);
    }

    if (this.#tabuleiro.temMina(posicao)) {
      this.#estado = ESTADO_DA_PARTIDA.DERROTA;
      return;
    }
    this.#revelarEmCascata(posicao);
    if (this.#chavesReveladas.size === TOTAL_DE_CELULAS_SEM_MINA) {
      this.#estado = ESTADO_DA_PARTIDA.VITORIA;
    }
  }

  alternarBandeira(posicao) {
    validarPosicao(posicao);
    this.#garantirQueEstaEmAndamento();
    const chave = chaveDaPosicao(posicao);
    if (this.#chavesReveladas.has(chave)) {
      throw new ErroDeRegra('Não é possível marcar bandeira em uma célula revelada.');
    }

    if (this.#chavesComBandeira.has(chave)) {
      this.#chavesComBandeira.delete(chave);
    } else {
      this.#chavesComBandeira.add(chave);
    }
  }

  consultarCelula(posicao) {
    validarPosicao(posicao);
    const chave = chaveDaPosicao(posicao);
    if (this.#terminou() && this.#tabuleiro.temMina(posicao)) {
      return { conteudo: CONTEUDO_DA_CELULA.MINA };
    }
    if (this.#chavesReveladas.has(chave)) {
      return {
        conteudo: CONTEUDO_DA_CELULA.REVELADA,
        minasVizinhas: this.#tabuleiro.contarMinasVizinhas(posicao),
      };
    }
    if (this.#chavesComBandeira.has(chave)) {
      return { conteudo: CONTEUDO_DA_CELULA.BANDEIRA };
    }
    return { conteudo: CONTEUDO_DA_CELULA.OCULTA };
  }

  #terminou() {
    return this.#estado !== ESTADO_DA_PARTIDA.EM_ANDAMENTO;
  }

  #garantirQueEstaEmAndamento() {
    if (this.#terminou()) {
      throw new ErroDeRegra('A partida já terminou.');
    }
  }

  #criarTabuleiro(primeiroClique) {
    const posicoesDasMinas = this.#gerarMinas({ ...primeiroClique });
    const tabuleiro = new Tabuleiro(posicoesDasMinas);
    if (posicoesDasMinas.some((mina) => estaNaAreaAoRedor(mina, primeiroClique))) {
      throw new RangeError('O gerador de minas colocou uma mina na área do primeiro clique.');
    }
    return tabuleiro;
  }

  #revelarEmCascata(posicaoInicial) {
    const pendentes = [posicaoInicial];
    while (pendentes.length > 0) {
      const posicao = pendentes.pop();
      const chave = chaveDaPosicao(posicao);
      const podeSerRevelada = !this.#chavesReveladas.has(chave) && !this.#chavesComBandeira.has(chave);
      if (podeSerRevelada) {
        this.#chavesReveladas.add(chave);
        if (this.#tabuleiro.contarMinasVizinhas(posicao) === 0) {
          pendentes.push(...posicoesVizinhas(posicao));
        }
      }
    }
  }
}

module.exports = { Partida, ESTADO_DA_PARTIDA, CONTEUDO_DA_CELULA };
