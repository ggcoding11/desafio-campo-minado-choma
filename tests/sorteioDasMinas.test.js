const { embaralhar, sortearMinas } = require('../src/sorteioDasMinas');
const { estaNaAreaAoRedor, chaveDaPosicao } = require('../src/posicao');
const {
  GERADOR_QUE_MANTEM_A_ORDEM,
  GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO,
  criarGeradorEmSequencia,
} = require('./helpers/geradoresDeNumeros');
const { posicoesDaLinha } = require('./helpers/posicoes');

describe('embaralhar', () => {
  test('um gerador que sorteia sempre o último índice mantém a ordem original', () => {
    expect(embaralhar(['a', 'b', 'c', 'd'], GERADOR_QUE_MANTEM_A_ORDEM)).toEqual(['a', 'b', 'c', 'd']);
  });

  test('um gerador que sorteia sempre o índice 0 troca cada item com o primeiro', () => {
    expect(embaralhar(['a', 'b', 'c', 'd'], GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO)).toEqual([
      'b', 'c', 'd', 'a',
    ]);
  });

  test('não altera a lista recebida', () => {
    const itens = ['a', 'b', 'c'];

    embaralhar(itens, GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO);

    expect(itens).toEqual(['a', 'b', 'c']);
  });

  test.each([
    [1],
    [-0.1],
    [NaN],
    [undefined],
  ])('lança RangeError quando o gerador devolve %p, fora de [0, 1)', (numeroInvalido) => {
    expect(() => embaralhar(['a', 'b'], () => numeroInvalido)).toThrow(
      new RangeError(
        `O gerador de números aleatórios deve devolver um valor em [0, 1); devolveu ${numeroInvalido}.`,
      ),
    );
  });
});

describe('sortearMinas', () => {
  test('sorteia exatamente 40 minas, sem repetição', () => {
    const minas = sortearMinas({ linha: 7, coluna: 9 }, criarGeradorEmSequencia([0.3, 0.7, 0.1, 0.9]));
    const chavesDistintas = new Set(minas.map(chaveDaPosicao));

    expect(minas).toHaveLength(40);
    expect(chavesDistintas.size).toBe(40);
  });

  test.each([
    ['no canto superior esquerdo', { linha: 0, coluna: 0 }],
    ['no canto inferior direito', { linha: 13, coluna: 17 }],
    ['na borda superior', { linha: 0, coluna: 9 }],
    ['no meio do tabuleiro', { linha: 7, coluna: 9 }],
  ])('nenhuma mina cai na área 3 x 3 do primeiro clique %s', (_descricao, primeiroClique) => {
    const geradores = [
      GERADOR_QUE_MANTEM_A_ORDEM,
      GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO,
      criarGeradorEmSequencia([0.5, 0.25, 0.75]),
    ];

    for (const gerador of geradores) {
      const minas = sortearMinas(primeiroClique, gerador);
      expect(minas.some((mina) => estaNaAreaAoRedor(mina, primeiroClique))).toBe(false);
    }
  });

  test('com um gerador que mantém a ordem, as minas são as 40 primeiras posições permitidas', () => {
    const minas = sortearMinas({ linha: 13, coluna: 17 }, GERADOR_QUE_MANTEM_A_ORDEM);

    expect(minas).toEqual([
      ...posicoesDaLinha(0, 0, 17),
      ...posicoesDaLinha(1, 0, 17),
      ...posicoesDaLinha(2, 0, 3),
    ]);
  });

  test('a área do primeiro clique é pulada mesmo quando cai entre as primeiras posições', () => {
    const minas = sortearMinas({ linha: 0, coluna: 0 }, GERADOR_QUE_MANTEM_A_ORDEM);

    expect(minas).toEqual([
      ...posicoesDaLinha(0, 2, 17),
      ...posicoesDaLinha(1, 2, 17),
      ...posicoesDaLinha(2, 0, 7),
    ]);
  });

  test('o mesmo gerador produz o mesmo tabuleiro', () => {
    const numeros = [0.42, 0.13, 0.88, 0.5];

    const primeiroSorteio = sortearMinas({ linha: 3, coluna: 3 }, criarGeradorEmSequencia(numeros));
    const segundoSorteio = sortearMinas({ linha: 3, coluna: 3 }, criarGeradorEmSequencia(numeros));

    expect(primeiroSorteio).toEqual(segundoSorteio);
  });

  test('geradores diferentes produzem tabuleiros diferentes', () => {
    const primeiroClique = { linha: 7, coluna: 9 };

    expect(sortearMinas(primeiroClique, GERADOR_QUE_MANTEM_A_ORDEM)).not.toEqual(
      sortearMinas(primeiroClique, GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO),
    );
  });

  test('sem gerador injetado, usa Math.random e respeita as mesmas regras', () => {
    const primeiroClique = { linha: 7, coluna: 9 };

    const minas = sortearMinas(primeiroClique);

    expect(minas).toHaveLength(40);
    expect(new Set(minas.map(chaveDaPosicao)).size).toBe(40);
    expect(minas.some((mina) => estaNaAreaAoRedor(mina, primeiroClique))).toBe(false);
  });

  test.each([
    ['TypeError', { linha: 'a', coluna: 0 }, TypeError],
    ['RangeError', { linha: 14, coluna: 0 }, RangeError],
  ])('lança %s para um primeiro clique inválido', (_nomeDoErro, primeiroClique, tipoDoErro) => {
    expect(() => sortearMinas(primeiroClique, GERADOR_QUE_MANTEM_A_ORDEM)).toThrow(tipoDoErro);
  });
});
