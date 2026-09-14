import { randomInt } from 'node:crypto'

/**
 * Alfabeto do codigo curto. Sem os caracteres ambiguos (0/O, 1/l/I) para que o
 * codigo continue legivel quando alguem precisa dita-lo ou transcreve-lo.
 */
export const ALFABETO = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'

/**
 * Gera um codigo curto aleatorio.
 * Usamos randomInt do modulo crypto em vez de Math.random: o codigo e o unico
 * segredo que protege um link, entao ele nao pode ser previsivel.
 */
export function gerarCodigo(tamanho) {
  if (!Number.isInteger(tamanho) || tamanho < 1) {
    throw new Error(`Tamanho de codigo invalido: ${tamanho}`)
  }

  let codigo = ''
  for (let i = 0; i < tamanho; i += 1) {
    codigo += ALFABETO[randomInt(ALFABETO.length)]
  }
  return codigo
}
