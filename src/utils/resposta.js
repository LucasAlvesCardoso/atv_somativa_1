/**
 * Envelope unico de resposta da API.
 * Sucesso: { sucesso: true, dados, meta? }
 * Erro:    { sucesso: false, erro: { codigo, mensagem, detalhes? } }
 */

export function enviarSucesso(res, status, dados, meta = null) {
  const corpo = meta ? { sucesso: true, dados, meta } : { sucesso: true, dados }
  return res.status(status).json(corpo)
}

export function enviarErro(res, status, codigo, mensagem, detalhes = null) {
  const erro = detalhes ? { codigo, mensagem, detalhes } : { codigo, mensagem }
  return res.status(status).json({ sucesso: false, erro })
}
