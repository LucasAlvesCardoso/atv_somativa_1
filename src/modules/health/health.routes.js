import { Router } from 'express'
import { contarLinks } from '../links/links.service.js'
import { enviarSucesso } from '../../utils/resposta.js'

const rotas = Router()

/**
 * Usado pelo HEALTHCHECK do container e pelos workflows de CI/CD para saber se
 * a aplicacao subiu antes de seguir com os proximos passos.
 */
rotas.get('/health', (req, res) =>
  enviarSucesso(res, 200, {
    status: 'ok',
    tempoAtivoEmSegundos: Math.floor(process.uptime()),
    totalDeLinks: contarLinks(),
  })
)

export default rotas
