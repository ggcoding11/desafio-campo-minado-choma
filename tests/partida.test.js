const { Partida, ESTADO_DA_PARTIDA, CONTEUDO_DA_CELULA } = require('../src/partida');
const { ErroDeRegra } = require('../src/erros');
const { todasAsPosicoes } = require('../src/posicao');
const {
  MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE,
  MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO,
} = require('./helpers/tabuleiros');

const CLIQUE_LONGE_DAS_MINAS = { linha: 5, coluna: 9 };
const CANTO_CERCADO_SEM_MINA = { linha: 0, coluna: 0 };
const MINA_DO_CANTO_CERCADO = { linha: 0, coluna: 1 };

function criarPartidaCom(minas) {
  return new Partida(() => minas);
}

function contarCelulasCom(partida, conteudo) {
  return todasAsPosicoes().filter((posicao) => partida.consultarCelula(posicao).conteudo === conteudo)
    .length;
}

function criarPartidaDepoisDoPrimeiroClique() {
  const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);
  partida.revelar(CLIQUE_LONGE_DAS_MINAS);
  return partida;
}

function criarPartidaVencida() {
  const partida = criarPartidaDepoisDoPrimeiroClique();
  partida.revelar(CANTO_CERCADO_SEM_MINA);
  return partida;
}

function criarPartidaPerdida() {
  const partida = criarPartidaDepoisDoPrimeiroClique();
  partida.revelar(MINA_DO_CANTO_CERCADO);
  return partida;
}

describe('Partida: início', () => {
  test('começa em andamento, com 40 minas restantes e todas as 252 células ocultas', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);

    expect(partida.estado).toBe(ESTADO_DA_PARTIDA.EM_ANDAMENTO);
    expect(partida.minasRestantes).toBe(40);
    expect(contarCelulasCom(partida, CONTEUDO_DA_CELULA.OCULTA)).toBe(252);
  });

  test.each([
    ['um texto', 'minas'],
    ['uma lista de minas', MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO],
    ['nulo', null],
  ])('lança TypeError quando o gerador de minas é %s', (_descricao, geradorInvalido) => {
    expect(() => new Partida(geradorInvalido)).toThrow(
      new TypeError('O gerador de minas deve ser uma função.'),
    );
  });

  test('as minas só são geradas no primeiro clique, uma única vez, a partir da posição clicada', () => {
    const gerarMinas = jest.fn(() => MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);
    const partida = new Partida(gerarMinas);

    partida.alternarBandeira({ linha: 3, coluna: 3 });
    expect(gerarMinas).not.toHaveBeenCalled();

    partida.revelar(CLIQUE_LONGE_DAS_MINAS);
    partida.revelar(CANTO_CERCADO_SEM_MINA);

    expect(gerarMinas).toHaveBeenCalledTimes(1);
    expect(gerarMinas).toHaveBeenCalledWith(CLIQUE_LONGE_DAS_MINAS);
  });

  test('o gerador recebe uma cópia do primeiro clique e não consegue alterá-lo', () => {
    const primeiroClique = { linha: 5, coluna: 9 };
    const partida = new Partida((posicao) => {
      posicao.linha = 0;
      return MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO;
    });

    partida.revelar(primeiroClique);

    expect(primeiroClique).toEqual({ linha: 5, coluna: 9 });
  });

  test('sem gerador injetado, sorteia as minas e o primeiro clique abre uma área sem minas vizinhas', () => {
    const partida = new Partida();

    partida.revelar({ linha: 7, coluna: 9 });

    expect(partida.consultarCelula({ linha: 7, coluna: 9 })).toEqual({
      conteudo: CONTEUDO_DA_CELULA.REVELADA,
      minasVizinhas: 0,
    });
  });
});

describe('Partida: primeiro clique', () => {
  test('o primeiro clique sempre cai numa célula sem minas vizinhas', () => {
    const partida = criarPartidaDepoisDoPrimeiroClique();

    expect(partida.consultarCelula(CLIQUE_LONGE_DAS_MINAS)).toEqual({
      conteudo: CONTEUDO_DA_CELULA.REVELADA,
      minasVizinhas: 0,
    });
  });

  test('vence logo no primeiro clique quando a cascata abre todas as células sem mina', () => {
    const partida = criarPartidaCom(MINAS_NO_FUNDO_EM_QUE_O_PRIMEIRO_CLIQUE_VENCE);

    partida.revelar({ linha: 0, coluna: 0 });

    expect(partida.estado).toBe(ESTADO_DA_PARTIDA.VITORIA);
  });

  test.each([
    ['na própria célula clicada', { linha: 0, coluna: 1 }],
    ['numa vizinha da célula clicada', CANTO_CERCADO_SEM_MINA],
    ['numa vizinha em diagonal da célula clicada', { linha: 2, coluna: 2 }],
  ])('lança RangeError quando o gerador põe uma mina %s', (_descricao, primeiroClique) => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);

    expect(() => partida.revelar(primeiroClique)).toThrow(
      new RangeError('O gerador de minas colocou uma mina na área do primeiro clique.'),
    );
  });

  test('um gerador inválido não deixa a partida pela metade', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);

    expect(() => partida.revelar(CANTO_CERCADO_SEM_MINA)).toThrow(RangeError);

    expect(partida.estado).toBe(ESTADO_DA_PARTIDA.EM_ANDAMENTO);
    expect(contarCelulasCom(partida, CONTEUDO_DA_CELULA.OCULTA)).toBe(252);
    partida.revelar(CLIQUE_LONGE_DAS_MINAS);
    expect(partida.consultarCelula(CLIQUE_LONGE_DAS_MINAS).conteudo).toBe(CONTEUDO_DA_CELULA.REVELADA);
  });

  test('lança RangeError quando o gerador devolve um tabuleiro sem 40 minas', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO.slice(1));

    expect(() => partida.revelar(CLIQUE_LONGE_DAS_MINAS)).toThrow(
      new RangeError('O tabuleiro deve ter exatamente 40 minas; recebeu 39.'),
    );
  });
});

describe('Partida: revelação em cascata', () => {
  test('a cascata abre todas as 211 células sem mina alcançáveis, menos o canto cercado', () => {
    const partida = criarPartidaDepoisDoPrimeiroClique();

    expect(contarCelulasCom(partida, CONTEUDO_DA_CELULA.REVELADA)).toBe(211);
    expect(partida.consultarCelula(CANTO_CERCADO_SEM_MINA)).toEqual({ conteudo: CONTEUDO_DA_CELULA.OCULTA });
    expect(partida.estado).toBe(ESTADO_DA_PARTIDA.EM_ANDAMENTO);
  });

  test('a cascata não revela nenhuma mina', () => {
    const partida = criarPartidaDepoisDoPrimeiroClique();

    for (const mina of MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO) {
      expect(partida.consultarCelula(mina)).toEqual({ conteudo: CONTEUDO_DA_CELULA.OCULTA });
    }
  });

  test.each([
    ['ao lado de duas minas do canto', { linha: 0, coluna: 2 }, 2],
    ['abaixo de duas minas do canto', { linha: 2, coluna: 0 }, 2],
    ['na diagonal de uma mina do canto', { linha: 2, coluna: 2 }, 1],
    ['acima de duas minas da borda inferior', { linha: 11, coluna: 0 }, 2],
    ['acima de três minas da borda inferior', { linha: 11, coluna: 5 }, 3],
    ['cercada por quatro minas no canto inferior', { linha: 11, coluna: 16 }, 4],
    ['na diagonal da mina isolada', { linha: 10, coluna: 16 }, 1],
  ])('a célula revelada %s, em %o, mostra %i minas vizinhas', (_descricao, posicao, minasVizinhas) => {
    const partida = criarPartidaDepoisDoPrimeiroClique();

    expect(partida.consultarCelula(posicao)).toEqual({
      conteudo: CONTEUDO_DA_CELULA.REVELADA,
      minasVizinhas,
    });
  });

  test('a cascata não abre células com bandeira', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);
    partida.alternarBandeira({ linha: 5, coluna: 0 });

    partida.revelar(CLIQUE_LONGE_DAS_MINAS);

    expect(partida.consultarCelula({ linha: 5, coluna: 0 })).toEqual({ conteudo: CONTEUDO_DA_CELULA.BANDEIRA });
    expect(contarCelulasCom(partida, CONTEUDO_DA_CELULA.REVELADA)).toBe(210);
  });

  test('revelar uma célula com minas vizinhas abre só ela, sem cascata', () => {
    const celulaNumerada = { linha: 2, coluna: 0 };
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);
    partida.alternarBandeira(celulaNumerada);
    partida.revelar(CLIQUE_LONGE_DAS_MINAS);
    partida.alternarBandeira(celulaNumerada);

    partida.revelar(celulaNumerada);

    expect(partida.consultarCelula(celulaNumerada)).toEqual({
      conteudo: CONTEUDO_DA_CELULA.REVELADA,
      minasVizinhas: 2,
    });
    expect(contarCelulasCom(partida, CONTEUDO_DA_CELULA.REVELADA)).toBe(211);
  });

  test('revelar depois do primeiro clique uma célula sem minas vizinhas também abre em cascata', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);
    for (let linha = 0; linha <= 11; linha++) {
      partida.alternarBandeira({ linha, coluna: 4 });
    }
    partida.revelar(CLIQUE_LONGE_DAS_MINAS);
    expect(partida.consultarCelula({ linha: 5, coluna: 3 }).conteudo).toBe(CONTEUDO_DA_CELULA.OCULTA);

    partida.alternarBandeira({ linha: 5, coluna: 4 });
    partida.revelar({ linha: 5, coluna: 4 });

    expect(partida.consultarCelula({ linha: 5, coluna: 3 }).conteudo).toBe(CONTEUDO_DA_CELULA.REVELADA);
    expect(partida.consultarCelula({ linha: 0, coluna: 2 }).conteudo).toBe(CONTEUDO_DA_CELULA.REVELADA);
    expect(partida.consultarCelula({ linha: 4, coluna: 4 }).conteudo).toBe(CONTEUDO_DA_CELULA.BANDEIRA);
    expect(partida.consultarCelula(CANTO_CERCADO_SEM_MINA).conteudo).toBe(CONTEUDO_DA_CELULA.OCULTA);
  });
});

describe('Partida: bandeiras', () => {
  test('marcar uma bandeira reduz as minas restantes e marcar de novo remove a bandeira', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);

    partida.alternarBandeira(MINA_DO_CANTO_CERCADO);
    expect(partida.consultarCelula(MINA_DO_CANTO_CERCADO)).toEqual({ conteudo: CONTEUDO_DA_CELULA.BANDEIRA });
    expect(partida.minasRestantes).toBe(39);

    partida.alternarBandeira(MINA_DO_CANTO_CERCADO);
    expect(partida.consultarCelula(MINA_DO_CANTO_CERCADO)).toEqual({ conteudo: CONTEUDO_DA_CELULA.OCULTA });
    expect(partida.minasRestantes).toBe(40);
  });

  test('não há limite de bandeiras: com 41 bandeiras, as minas restantes ficam em -1', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);

    todasAsPosicoes().slice(0, 41).forEach((posicao) => partida.alternarBandeira(posicao));

    expect(partida.minasRestantes).toBe(-1);
  });

  test('revelar uma célula com bandeira é proibido e não muda nada', () => {
    const gerarMinas = jest.fn(() => MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);
    const partida = new Partida(gerarMinas);
    partida.alternarBandeira(CLIQUE_LONGE_DAS_MINAS);

    expect(() => partida.revelar(CLIQUE_LONGE_DAS_MINAS)).toThrow(
      new ErroDeRegra('Não é possível revelar uma célula com bandeira.'),
    );
    expect(gerarMinas).not.toHaveBeenCalled();
    expect(partida.consultarCelula(CLIQUE_LONGE_DAS_MINAS)).toEqual({ conteudo: CONTEUDO_DA_CELULA.BANDEIRA });
  });

  test('marcar bandeira em uma célula revelada é proibido', () => {
    const partida = criarPartidaDepoisDoPrimeiroClique();

    expect(() => partida.alternarBandeira(CLIQUE_LONGE_DAS_MINAS)).toThrow(
      new ErroDeRegra('Não é possível marcar bandeira em uma célula revelada.'),
    );
    expect(partida.minasRestantes).toBe(40);
  });
});

describe('Partida: revelar de novo', () => {
  test('revelar uma célula já revelada é proibido', () => {
    const partida = criarPartidaDepoisDoPrimeiroClique();

    expect(() => partida.revelar(CLIQUE_LONGE_DAS_MINAS)).toThrow(
      new ErroDeRegra('Esta célula já foi revelada.'),
    );
  });
});

describe('Partida: vitória', () => {
  test('vence ao revelar a última célula sem mina, mesmo sem marcar nenhuma bandeira', () => {
    const partida = criarPartidaVencida();

    expect(partida.estado).toBe(ESTADO_DA_PARTIDA.VITORIA);
    expect(partida.minasRestantes).toBe(40);
    expect(partida.consultarCelula(CANTO_CERCADO_SEM_MINA)).toEqual({
      conteudo: CONTEUDO_DA_CELULA.REVELADA,
      minasVizinhas: 3,
    });
  });

  test('ao vencer, as 40 minas ficam visíveis', () => {
    const partida = criarPartidaVencida();

    expect(contarCelulasCom(partida, CONTEUDO_DA_CELULA.MINA)).toBe(40);
  });
});

describe('Partida: derrota', () => {
  test('revelar uma mina encerra a partida com derrota', () => {
    const partida = criarPartidaPerdida();

    expect(partida.estado).toBe(ESTADO_DA_PARTIDA.DERROTA);
    expect(partida.consultarCelula(MINA_DO_CANTO_CERCADO)).toEqual({ conteudo: CONTEUDO_DA_CELULA.MINA });
  });

  test('ao perder, as 40 minas ficam visíveis, inclusive as que tinham bandeira', () => {
    const partida = criarPartidaDepoisDoPrimeiroClique();
    partida.alternarBandeira({ linha: 1, coluna: 0 });

    partida.revelar(MINA_DO_CANTO_CERCADO);

    expect(partida.consultarCelula({ linha: 1, coluna: 0 })).toEqual({ conteudo: CONTEUDO_DA_CELULA.MINA });
    expect(contarCelulasCom(partida, CONTEUDO_DA_CELULA.MINA)).toBe(40);
  });

  test('ao perder, uma bandeira em célula sem mina continua como bandeira', () => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);
    partida.alternarBandeira({ linha: 2, coluna: 0 });
    partida.revelar(CLIQUE_LONGE_DAS_MINAS);

    partida.revelar(MINA_DO_CANTO_CERCADO);

    expect(partida.consultarCelula({ linha: 2, coluna: 0 })).toEqual({ conteudo: CONTEUDO_DA_CELULA.BANDEIRA });
  });
});

describe('Partida: fim de jogo', () => {
  test.each([
    ['vitória', criarPartidaVencida, 'revelar', { linha: 0, coluna: 1 }],
    ['vitória', criarPartidaVencida, 'alternarBandeira', { linha: 0, coluna: 1 }],
    ['derrota', criarPartidaPerdida, 'revelar', CANTO_CERCADO_SEM_MINA],
    ['derrota', criarPartidaPerdida, 'alternarBandeira', CANTO_CERCADO_SEM_MINA],
  ])('depois da %s, %s é recusado', (_resultado, criarPartidaEncerrada, acao, posicao) => {
    const partida = criarPartidaEncerrada();
    const estadoFinal = partida.estado;

    expect(() => partida[acao](posicao)).toThrow(new ErroDeRegra('A partida já terminou.'));
    expect(partida.estado).toBe(estadoFinal);
  });
});

describe('Partida: argumentos inválidos', () => {
  test.each([
    ['revelar', { linha: 'a', coluna: 0 }, TypeError],
    ['revelar', { linha: 14, coluna: 0 }, RangeError],
    ['alternarBandeira', null, TypeError],
    ['alternarBandeira', { linha: 0, coluna: 18 }, RangeError],
    ['consultarCelula', {}, TypeError],
    ['consultarCelula', { linha: -1, coluna: 0 }, RangeError],
  ])('%s(%o) lança %p', (acao, posicao, tipoDoErro) => {
    const partida = criarPartidaCom(MINAS_QUE_CERCAM_O_CANTO_SUPERIOR_ESQUERDO);

    expect(() => partida[acao](posicao)).toThrow(tipoDoErro);
  });
});

describe('Partida: encapsulamento', () => {
  test('alterar o objeto devolvido por consultarCelula não muda a célula', () => {
    const partida = criarPartidaDepoisDoPrimeiroClique();
    const celula = partida.consultarCelula({ linha: 0, coluna: 2 });

    celula.minasVizinhas = 0;
    celula.conteudo = CONTEUDO_DA_CELULA.OCULTA;

    expect(partida.consultarCelula({ linha: 0, coluna: 2 })).toEqual({
      conteudo: CONTEUDO_DA_CELULA.REVELADA,
      minasVizinhas: 2,
    });
  });

  test('os estados da partida e os conteúdos de célula não podem ser alterados', () => {
    expect(Object.isFrozen(ESTADO_DA_PARTIDA)).toBe(true);
    expect(Object.isFrozen(CONTEUDO_DA_CELULA)).toBe(true);
  });
});
