import { criarApp } from './app.js'
import { env } from './config/env.js'

const servidor = criarApp().listen(env.PORT, () => {
  console.log(`[encurtador] escutando em ${env.URL_BASE} (ambiente: ${env.NODE_ENV})`)
})

/**
 * `docker stop` envia SIGTERM. Sem este tratamento o Docker esperaria o timeout
 * e mataria o processo com SIGKILL, derrubando conexoes em andamento.
 */
function encerrar(sinal) {
  console.log(`[encurtador] ${sinal} recebido, encerrando...`)
  servidor.close(() => process.exit(0))
}

process.on('SIGTERM', () => encerrar('SIGTERM'))
process.on('SIGINT', () => encerrar('SIGINT'))
