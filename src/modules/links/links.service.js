import { env } from '../../config/env.js'
import { gerarCodigo } from '../../lib/slug.js'
import { validarCodigoPersonalizado, validarUrl } from '../../lib/validacao.js'
import { HttpError } from '../../utils/httpError.js'
import * as repositorio from './links.repository.js'

/**
 * Tentativas de gerar um codigo livre antes de desistir. Com o alfabeto e o
 * tamanho padrao a chance de 10 colisoes seguidas e desprezivel; se acontecer,
 * o espaco de codigos esta saturado e responder 503 e mais honesto que insistir.
 */
const MAXIMO_TENTATIVAS_CODIGO = 10

function montarUrlCurta(codigo) {
  return `${env.URL_BASE.replace(/\/+$/, '')}/${codigo}`
}

/** Representacao publica de um link, com o campo derivado que o cliente consome. */
export function apresentar(link) {
  return {
    codigo: link.codigo,
    url: link.url,
    urlCurta: montarUrlCurta(link.codigo),
    acessos: link.acessos,
    criadoEm: link.criadoEm,
    ultimoAcessoEm: link.ultimoAcessoEm,
  }
}

function reservarCodigoAleatorio() {
  for (let tentativa = 0; tentativa < MAXIMO_TENTATIVAS_CODIGO; tentativa += 1) {
    const codigo = gerarCodigo(env.TAMANHO_CODIGO)
    if (!repositorio.existe(codigo)) return codigo
  }

  throw HttpError.indisponivel(
    'Nao foi possivel gerar um codigo livre no momento. Tente novamente.'
  )
}

function resolverCodigoPersonalizado(valor) {
  const resultado = validarCodigoPersonalizado(valor)
  if (!resultado.valido) {
    throw HttpError.requisicaoInvalida(resultado.motivo)
  }

  if (repositorio.existe(resultado.codigo)) {
    throw HttpError.conflito(`O codigo "${resultado.codigo}" ja esta em uso.`)
  }

  return resultado.codigo
}

export function criarLink({ url, codigo }) {
  const urlValidada = validarUrl(url)
  if (!urlValidada.valido) {
    throw HttpError.requisicaoInvalida(urlValidada.motivo)
  }

  const codigoFinal =
    codigo === undefined || codigo === null
      ? reservarCodigoAleatorio()
      : resolverCodigoPersonalizado(codigo)

  return repositorio.salvar({
    codigo: codigoFinal,
    url: urlValidada.url,
    acessos: 0,
    criadoEm: new Date().toISOString(),
    ultimoAcessoEm: null,
  })
}

export function buscarLink(codigo) {
  const link = repositorio.buscarPorCodigo(codigo)
  if (!link) {
    throw HttpError.naoEncontrado(`Nenhum link encontrado para o codigo "${codigo}".`)
  }
  return link
}

/** Busca o destino e contabiliza o acesso na mesma operacao. */
export function resolverDestino(codigo) {
  buscarLink(codigo)
  const atualizado = repositorio.registrarAcesso(codigo, new Date().toISOString())
  return atualizado.url
}

export function listarLinks() {
  return repositorio.listar()
}

export function contarLinks() {
  return repositorio.contar()
}

export function removerLink(codigo) {
  buscarLink(codigo)
  repositorio.remover(codigo)
}
