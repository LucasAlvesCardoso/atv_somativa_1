/**
 * Validacao das entradas do modulo de links.
 * Tudo que chega da rede passa por aqui antes de virar dado da aplicacao.
 */

export const TAMANHO_MAXIMO_URL = 2048
export const PROTOCOLOS_PERMITIDOS = Object.freeze(['http:', 'https:'])

const FORMATO_CODIGO_PERSONALIZADO = /^[A-Za-z0-9_-]{3,32}$/

/**
 * Codigos que colidiriam com rotas da propria API. Se alguem encurtasse um link
 * como /health, o redirect nunca seria alcancado.
 */
const CODIGOS_RESERVADOS = Object.freeze(['health', 'links', 'api', 'docs', 'favicon.ico'])

/** @returns {{ valido: true, url: string } | { valido: false, motivo: string }} */
export function validarUrl(valor) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    return { valido: false, motivo: 'O campo "url" e obrigatorio e deve ser um texto.' }
  }

  const url = valor.trim()

  if (url.length > TAMANHO_MAXIMO_URL) {
    return {
      valido: false,
      motivo: `A URL excede o tamanho maximo de ${TAMANHO_MAXIMO_URL} caracteres.`,
    }
  }

  let analisada
  try {
    analisada = new URL(url)
  } catch {
    return { valido: false, motivo: 'A URL informada nao e valida.' }
  }

  // Bloqueia javascript: e data:, que transformariam o redirect em vetor de XSS.
  if (!PROTOCOLOS_PERMITIDOS.includes(analisada.protocol)) {
    return { valido: false, motivo: 'Somente URLs com protocolo http ou https sao aceitas.' }
  }

  if (!analisada.hostname) {
    return { valido: false, motivo: 'A URL informada nao possui um dominio.' }
  }

  return { valido: true, url }
}

/** @returns {{ valido: true, codigo: string } | { valido: false, motivo: string }} */
export function validarCodigoPersonalizado(valor) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    return { valido: false, motivo: 'O codigo personalizado deve ser um texto nao vazio.' }
  }

  const codigo = valor.trim()

  if (!FORMATO_CODIGO_PERSONALIZADO.test(codigo)) {
    return {
      valido: false,
      motivo: 'O codigo personalizado deve ter de 3 a 32 caracteres, usando apenas letras, numeros, hifen ou sublinhado.',
    }
  }

  if (CODIGOS_RESERVADOS.includes(codigo.toLowerCase())) {
    return { valido: false, motivo: `O codigo "${codigo}" e reservado pela aplicacao.` }
  }

  return { valido: true, codigo }
}
