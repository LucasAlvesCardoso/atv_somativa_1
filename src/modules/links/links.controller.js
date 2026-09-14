import { enviarSucesso } from '../../utils/resposta.js'
import * as servico from './links.service.js'

export function criar(req, res) {
  const link = servico.criarLink({ url: req.body?.url, codigo: req.body?.codigo })
  return enviarSucesso(res, 201, servico.apresentar(link))
}

export function listar(req, res) {
  const links = servico.listarLinks()
  return enviarSucesso(res, 200, links.map(servico.apresentar), { total: links.length })
}

export function detalhar(req, res) {
  const link = servico.buscarLink(req.params.codigo)
  return enviarSucesso(res, 200, servico.apresentar(link))
}

export function remover(req, res) {
  servico.removerLink(req.params.codigo)
  return res.status(204).end()
}

/**
 * Redireciona para o destino original.
 * Usamos 302 (e nao 301) de proposito: o 301 fica em cache no navegador e os
 * acessos seguintes deixariam de passar pela API, zerando a contagem.
 */
export function redirecionar(req, res) {
  const destino = servico.resolverDestino(req.params.codigo)
  return res.redirect(302, destino)
}
