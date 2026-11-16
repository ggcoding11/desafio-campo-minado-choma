const {
  LINHAS,
  COLUNAS,
  TOTAL_DE_MINAS,
  TOTAL_DE_CELULAS,
  TOTAL_DE_CELULAS_SEM_MINA,
} = require('../src/constantes');

const CELULAS_NA_AREA_DO_PRIMEIRO_CLIQUE = 9;

describe('constantes do tabuleiro', () => {
  test('o tabuleiro tem 14 linhas e 18 colunas, como pede a especificação 18 x 14', () => {
    expect(LINHAS).toBe(14);
    expect(COLUNAS).toBe(18);
  });

  test('o tabuleiro tem 40 minas', () => {
    expect(TOTAL_DE_MINAS).toBe(40);
  });

  test('o tabuleiro tem 252 células, das quais 212 sem mina', () => {
    expect(TOTAL_DE_CELULAS).toBe(252);
    expect(TOTAL_DE_CELULAS_SEM_MINA).toBe(212);
  });

  test('sobram células suficientes para as minas fora da área do primeiro clique', () => {
    expect(TOTAL_DE_CELULAS - CELULAS_NA_AREA_DO_PRIMEIRO_CLIQUE).toBeGreaterThanOrEqual(TOTAL_DE_MINAS);
  });
});
