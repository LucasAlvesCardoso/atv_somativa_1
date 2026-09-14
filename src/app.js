import express from 'express'
import healthRoutes from './modules/health/health.routes.js'
import linksRoutes from './modules/links/links.routes.js'
import { redirecionar } from './modules/links/links.controller.js'
import { rotaNaoEncontrada } from './middleware/notFound.js'
import { tratarErros } from './middleware/errorHandler.js'

const TAMANHO_MAXIMO_CORPO = '16kb'

export function criarApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json({ limit: TAMANHO_MAXIMO_CORPO }))

  app.use(healthRoutes)
  app.use(linksRoutes)

  // Precisa vir depois das rotas nomeadas, senao /:codigo capturaria /links.
  app.get('/:codigo', redirecionar)

  app.use(rotaNaoEncontrada)
  app.use(tratarErros)

  return app
}
