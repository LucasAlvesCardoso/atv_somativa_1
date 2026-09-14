import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { criarApp } from '../src/app.js'
import { limpar } from '../src/modules/links/links.repository.js'

const app = criarApp()

beforeEach(() => limpar())

describe('GET /health', () => {
  it('responde 200 com o status da aplicacao', async () => {
    const resposta = await request(app).get('/health')

    expect(resposta.status).toBe(200)
    expect(resposta.body.sucesso).toBe(true)
    expect(resposta.body.dados.status).toBe('ok')
    expect(resposta.body.dados.tempoAtivoEmSegundos).toBeGreaterThanOrEqual(0)
  })

  it('informa quantos links estao armazenados', async () => {
    await request(app).post('/links').send({ url: 'https://exemplo.com' })

    const resposta = await request(app).get('/health')

    expect(resposta.body.dados.totalDeLinks).toBe(1)
  })
})

describe('rotas inexistentes', () => {
  it('responde 404 com o envelope de erro em metodo nao mapeado', async () => {
    const resposta = await request(app).put('/links')

    expect(resposta.status).toBe(404)
    expect(resposta.body).toEqual({
      sucesso: false,
      erro: {
        codigo: 'ROTA_NAO_ENCONTRADA',
        mensagem: 'Rota nao encontrada: PUT /links',
      },
    })
  })
})
