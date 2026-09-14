import { describe, expect, it } from 'vitest'
import express from 'express'
import request from 'supertest'
import { tratarErros } from '../src/middleware/errorHandler.js'

/** App minimo cuja unica rota lanca o erro que queremos observar. */
function appQueLanca(erro) {
  const app = express()
  app.get('/falha', () => {
    throw erro
  })
  app.use(tratarErros)
  return app
}

describe('tratarErros com erro nao previsto', () => {
  it('responde 500 com o envelope de erro padrao', async () => {
    const resposta = await request(appQueLanca(new Error('detalhe interno'))).get('/falha')

    expect(resposta.status).toBe(500)
    expect(resposta.body).toEqual({
      sucesso: false,
      erro: {
        codigo: 'ERRO_INTERNO',
        mensagem: 'Erro interno no servidor. Tente novamente mais tarde.',
      },
    })
  })

  it('nao expoe a mensagem original nem a stack do erro', async () => {
    const erro = new Error('conexao com o banco em 10.0.0.7 recusada')

    const resposta = await request(appQueLanca(erro)).get('/falha')

    const corpo = JSON.stringify(resposta.body)
    expect(corpo).not.toContain('10.0.0.7')
    expect(corpo).not.toContain('stack')
  })
})
