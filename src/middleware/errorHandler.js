import { env } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'
import { enviarErro } from '../utils/resposta.js'

/**
 * Tratador central de erros.
 * Detalhes tecnicos ficam no log do servidor; o cliente recebe apenas a
 * informacao necessaria, para nao vazar dados internos (stack, caminhos).
 */
export function tratarErros(erro, req, res, _next) {
  if (erro instanceof HttpError) {
    return enviarErro(res, erro.status, erro.codigo, erro.message, erro.detalhes)
  }

  if (erro?.type === 'entity.parse.failed') {
    return enviarErro(res, 400, 'JSON_INVALIDO', 'O corpo da requisicao nao e um JSON valido.')
  }

  if (erro?.type === 'entity.too.large') {
    return enviarErro(
      res,
      413,
      'CORPO_MUITO_GRANDE',
      'O corpo da requisicao excede o tamanho maximo permitido.'
    )
  }

  if (!env.IS_TEST) {
    console.error('[erro-nao-tratado]', erro)
  }

  return enviarErro(res, 500, 'ERRO_INTERNO', 'Erro interno no servidor. Tente novamente mais tarde.')
}
