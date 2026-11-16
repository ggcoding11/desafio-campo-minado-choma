const GERADOR_QUE_MANTEM_A_ORDEM = () => 1 - Number.EPSILON;

const GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO = () => 0;

function criarGeradorEmSequencia(numeros) {
  let indice = 0;
  return () => {
    const numero = numeros[indice % numeros.length];
    indice++;
    return numero;
  };
}

module.exports = {
  GERADOR_QUE_MANTEM_A_ORDEM,
  GERADOR_QUE_SEMPRE_TROCA_COM_O_PRIMEIRO,
  criarGeradorEmSequencia,
};
