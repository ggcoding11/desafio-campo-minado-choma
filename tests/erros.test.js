const { ErroDeRegra } = require('../src/erros');

describe('ErroDeRegra', () => {
  test('é um Error com nome próprio e a mensagem recebida', () => {
    const erro = new ErroDeRegra('A partida já terminou.');

    expect(erro).toBeInstanceOf(Error);
    expect(erro.name).toBe('ErroDeRegra');
    expect(erro.message).toBe('A partida já terminou.');
  });
});
