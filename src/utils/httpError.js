/**
 * Erro de aplicacao com status HTTP e codigo estavel.
 * O codigo permite que o cliente reaja sem depender do texto da mensagem.
 */
export class HttpError extends Error {
  constructor(status, codigo, mensagem, detalhes = null) {
    super(mensagem)
    this.name = 'HttpError'
    this.status = status
    this.codigo = codigo
    this.detalhes = detalhes
  }

  static requisicaoInvalida(mensagem, detalhes = null) {
    return new HttpError(400, 'REQUISICAO_INVALIDA', mensagem, detalhes)
  }

  static naoEncontrado(mensagem = 'Recurso nao encontrado.') {
    return new HttpError(404, 'NAO_ENCONTRADO', mensagem)
  }

  static conflito(mensagem, detalhes = null) {
    return new HttpError(409, 'CONFLITO', mensagem, detalhes)
  }

  static indisponivel(mensagem) {
    return new HttpError(503, 'INDISPONIVEL', mensagem)
  }
}
