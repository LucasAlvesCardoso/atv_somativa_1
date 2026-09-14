import { enviarErro } from '../utils/resposta.js'

export function rotaNaoEncontrada(req, res) {
  return enviarErro(
    res,
    404,
    'ROTA_NAO_ENCONTRADA',
    `Rota nao encontrada: ${req.method} ${req.originalUrl}`
  )
}
