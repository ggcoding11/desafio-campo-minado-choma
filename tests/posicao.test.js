const {
  validarPosicao,
  posicoesVizinhas,
  estaNaAreaAoRedor,
  todasAsPosicoes,
  chaveDaPosicao,
} = require('../src/posicao');

describe('validarPosicao', () => {
  test.each([
    ['canto superior esquerdo', { linha: 0, coluna: 0 }],
    ['canto superior direito', { linha: 0, coluna: 17 }],
    ['canto inferior esquerdo', { linha: 13, coluna: 0 }],
    ['canto inferior direito', { linha: 13, coluna: 17 }],
    ['meio do tabuleiro', { linha: 7, coluna: 9 }],
  ])('aceita o %s', (_descricao, posicao) => {
    expect(() => validarPosicao(posicao)).not.toThrow();
  });

  test.each([
    ['nula', null],
    ['indefinida', undefined],
    ['sem linha nem coluna', {}],
    ['com linha em texto', { linha: '0', coluna: 0 }],
    ['com linha fracionária', { linha: 1.5, coluna: 0 }],
    ['com coluna NaN', { linha: 0, coluna: NaN }],
  ])('lança TypeError para posição %s', (_descricao, posicao) => {
    expect(() => validarPosicao(posicao)).toThrow(
      new TypeError('A posição deve ter linha e coluna inteiras.'),
    );
  });

  test.each([
    [{ linha: -1, coluna: 0 }],
    [{ linha: 14, coluna: 0 }],
    [{ linha: 0, coluna: -1 }],
    [{ linha: 0, coluna: 18 }],
  ])('lança RangeError para a posição %o, fora do tabuleiro', (posicao) => {
    expect(() => validarPosicao(posicao)).toThrow(
      new RangeError(
        `A posição (${posicao.linha}, ${posicao.coluna}) está fora do tabuleiro 14 x 18.`,
      ),
    );
  });
});

describe('posicoesVizinhas', () => {
  test('uma célula no meio do tabuleiro tem 8 vizinhas, contando as diagonais', () => {
    expect(posicoesVizinhas({ linha: 5, coluna: 5 })).toEqual([
      { linha: 4, coluna: 4 }, { linha: 4, coluna: 5 }, { linha: 4, coluna: 6 },
      { linha: 5, coluna: 4 }, { linha: 5, coluna: 6 },
      { linha: 6, coluna: 4 }, { linha: 6, coluna: 5 }, { linha: 6, coluna: 6 },
    ]);
  });

  test('uma célula no canto tem apenas 3 vizinhas', () => {
    expect(posicoesVizinhas({ linha: 13, coluna: 17 })).toEqual([
      { linha: 12, coluna: 16 }, { linha: 12, coluna: 17 }, { linha: 13, coluna: 16 },
    ]);
  });

  test.each([
    ['superior', { linha: 0, coluna: 9 }],
    ['inferior', { linha: 13, coluna: 9 }],
    ['esquerda', { linha: 7, coluna: 0 }],
    ['direita', { linha: 7, coluna: 17 }],
  ])('uma célula na borda %s tem 5 vizinhas', (_borda, posicao) => {
    expect(posicoesVizinhas(posicao)).toHaveLength(5);
  });

  test('a própria célula não é vizinha de si mesma', () => {
    expect(posicoesVizinhas({ linha: 5, coluna: 5 })).not.toContainEqual({ linha: 5, coluna: 5 });
  });

  test('valida a posição recebida', () => {
    expect(() => posicoesVizinhas({ linha: 14, coluna: 0 })).toThrow(RangeError);
  });
});

describe('estaNaAreaAoRedor', () => {
  const centro = { linha: 5, coluna: 5 };

  test.each([
    [{ linha: 5, coluna: 5 }, true],
    [{ linha: 4, coluna: 4 }, true],
    [{ linha: 6, coluna: 6 }, true],
    [{ linha: 4, coluna: 6 }, true],
    [{ linha: 3, coluna: 5 }, false],
    [{ linha: 5, coluna: 7 }, false],
    [{ linha: 7, coluna: 7 }, false],
  ])('a posição %o está na área 3 x 3 ao redor de (5, 5)? %s', (posicao, esperado) => {
    expect(estaNaAreaAoRedor(posicao, centro)).toBe(esperado);
  });
});

describe('todasAsPosicoes', () => {
  test('lista as 252 posições do tabuleiro, sem repetição, linha por linha', () => {
    const posicoes = todasAsPosicoes();
    const chavesDistintas = new Set(posicoes.map(chaveDaPosicao));

    expect(posicoes).toHaveLength(252);
    expect(chavesDistintas.size).toBe(252);
    expect(posicoes[0]).toEqual({ linha: 0, coluna: 0 });
    expect(posicoes[17]).toEqual({ linha: 0, coluna: 17 });
    expect(posicoes[18]).toEqual({ linha: 1, coluna: 0 });
    expect(posicoes[251]).toEqual({ linha: 13, coluna: 17 });
  });
});

describe('chaveDaPosicao', () => {
  test('gera chaves diferentes para posições com linha e coluna trocadas', () => {
    expect(chaveDaPosicao({ linha: 1, coluna: 11 })).not.toBe(chaveDaPosicao({ linha: 11, coluna: 1 }));
  });
});
