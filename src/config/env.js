/**
 * Configuracao da aplicacao lida do ambiente.
 * Validamos na carga do modulo para falhar rapido: e melhor o processo nao subir
 * do que subir com um valor invalido e so descobrir em producao.
 */

const PORTA_PADRAO = 3000
const TAMANHO_CODIGO_PADRAO = 7
const TAMANHO_CODIGO_MINIMO = 4
const TAMANHO_CODIGO_MAXIMO = 12

function lerInteiro(valor, padrao, nome) {
  if (valor === undefined || valor === '') return padrao

  const numero = Number(valor)
  if (!Number.isInteger(numero)) {
    throw new Error(`Variavel de ambiente ${nome} deve ser um numero inteiro. Recebido: "${valor}"`)
  }
  return numero
}

function validarPorta(porta) {
  if (porta < 1 || porta > 65535) {
    throw new Error(`Variavel de ambiente PORT deve estar entre 1 e 65535. Recebido: ${porta}`)
  }
  return porta
}

function validarTamanhoCodigo(tamanho) {
  if (tamanho < TAMANHO_CODIGO_MINIMO || tamanho > TAMANHO_CODIGO_MAXIMO) {
    throw new Error(
      `Variavel de ambiente TAMANHO_CODIGO deve estar entre ${TAMANHO_CODIGO_MINIMO} e ${TAMANHO_CODIGO_MAXIMO}. Recebido: ${tamanho}`
    )
  }
  return tamanho
}

function carregarEnv(fonte = process.env) {
  const porta = validarPorta(lerInteiro(fonte.PORT, PORTA_PADRAO, 'PORT'))

  return Object.freeze({
    PORT: porta,
    // Nao use o nome BASE_URL: o Vite reserva essa variavel e a injeta em
    // process.env como '/', o que quebraria a montagem do link curto nos testes.
    URL_BASE: fonte.URL_BASE || `http://localhost:${porta}`,
    TAMANHO_CODIGO: validarTamanhoCodigo(
      lerInteiro(fonte.TAMANHO_CODIGO, TAMANHO_CODIGO_PADRAO, 'TAMANHO_CODIGO')
    ),
    NODE_ENV: fonte.NODE_ENV || 'development',
    IS_TEST: fonte.NODE_ENV === 'test',
  })
}

const env = carregarEnv()

export { env, carregarEnv, TAMANHO_CODIGO_MINIMO, TAMANHO_CODIGO_MAXIMO }
