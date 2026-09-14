import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { criarApp } from '../src/app.js'
import { limpar } from '../src/modules/links/links.repository.js'

const app = criarApp()

beforeEach(() => limpar())

async function criarLink(corpo) {
  return request(app).post('/links').send(corpo)
}

describe('POST /links', () => {
  it('cria um link curto e devolve 201 com o codigo gerado', async () => {
    const resposta = await criarLink({ url: 'https://exemplo.com/artigo' })

    expect(resposta.status).toBe(201)
    expect(resposta.body.sucesso).toBe(true)
    expect(resposta.body.dados).toMatchObject({
      url: 'https://exemplo.com/artigo',
      acessos: 0,
      ultimoAcessoEm: null,
    })
    expect(resposta.body.dados.codigo).toHaveLength(7)
    expect(resposta.body.dados.urlCurta).toBe(
      `http://localhost:3000/${resposta.body.dados.codigo}`
    )
  })

  it('aceita um codigo personalizado informado pelo cliente', async () => {
    const resposta = await criarLink({ url: 'https://exemplo.com', codigo: 'devops' })

    expect(resposta.status).toBe(201)
    expect(resposta.body.dados.codigo).toBe('devops')
  })

  it('gera codigos diferentes para links diferentes', async () => {
    const primeira = await criarLink({ url: 'https://exemplo.com/a' })
    const segunda = await criarLink({ url: 'https://exemplo.com/b' })

    expect(primeira.body.dados.codigo).not.toBe(segunda.body.dados.codigo)
  })

  it('responde 400 quando a url esta ausente', async () => {
    const resposta = await criarLink({})

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro.codigo).toBe('REQUISICAO_INVALIDA')
  })

  it('responde 400 quando a url tem protocolo nao permitido', async () => {
    const resposta = await criarLink({ url: 'javascript:alert(1)' })

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro.mensagem).toMatch(/http ou https/)
  })

  it('responde 400 quando o codigo personalizado e invalido', async () => {
    const resposta = await criarLink({ url: 'https://exemplo.com', codigo: 'ab' })

    expect(resposta.status).toBe(400)
  })

  it('responde 409 quando o codigo personalizado ja esta em uso', async () => {
    await criarLink({ url: 'https://exemplo.com/a', codigo: 'repetido' })

    const resposta = await criarLink({ url: 'https://exemplo.com/b', codigo: 'repetido' })

    expect(resposta.status).toBe(409)
    expect(resposta.body.erro.codigo).toBe('CONFLITO')
  })

  it('responde 400 quando o corpo nao e um JSON valido', async () => {
    const resposta = await request(app)
      .post('/links')
      .set('Content-Type', 'application/json')
      .send('{ isto nao e json }')

    expect(resposta.status).toBe(400)
    expect(resposta.body.erro.codigo).toBe('JSON_INVALIDO')
  })

  it('responde 413 quando o corpo excede o limite aceito', async () => {
    const resposta = await request(app)
      .post('/links')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ url: `https://exemplo.com/${'a'.repeat(20_000)}` }))

    expect(resposta.status).toBe(413)
    expect(resposta.body.erro.codigo).toBe('CORPO_MUITO_GRANDE')
  })
})

describe('GET /:codigo', () => {
  it('redireciona com 302 para a url original', async () => {
    const { body } = await criarLink({ url: 'https://exemplo.com/destino' })

    const resposta = await request(app).get(`/${body.dados.codigo}`)

    expect(resposta.status).toBe(302)
    expect(resposta.headers.location).toBe('https://exemplo.com/destino')
  })

  it('contabiliza cada acesso realizado', async () => {
    const { body } = await criarLink({ url: 'https://exemplo.com' })
    const codigo = body.dados.codigo

    await request(app).get(`/${codigo}`)
    await request(app).get(`/${codigo}`)

    const detalhe = await request(app).get(`/links/${codigo}`)

    expect(detalhe.body.dados.acessos).toBe(2)
    expect(detalhe.body.dados.ultimoAcessoEm).not.toBeNull()
  })

  it('responde 404 para um codigo inexistente', async () => {
    const resposta = await request(app).get('/naoexiste')

    expect(resposta.status).toBe(404)
    expect(resposta.body.erro.codigo).toBe('NAO_ENCONTRADO')
  })
})

describe('GET /links', () => {
  it('devolve uma lista vazia com total zero quando nao ha links', async () => {
    const resposta = await request(app).get('/links')

    expect(resposta.status).toBe(200)
    expect(resposta.body.dados).toEqual([])
    expect(resposta.body.meta).toEqual({ total: 0 })
  })

  it('lista os links cadastrados com o total no meta', async () => {
    await criarLink({ url: 'https://exemplo.com/a' })
    await criarLink({ url: 'https://exemplo.com/b' })

    const resposta = await request(app).get('/links')

    expect(resposta.body.dados).toHaveLength(2)
    expect(resposta.body.meta.total).toBe(2)
  })
})

describe('GET /links/:codigo', () => {
  it('devolve os detalhes do link sem contabilizar acesso', async () => {
    const { body } = await criarLink({ url: 'https://exemplo.com', codigo: 'detalhe' })

    const resposta = await request(app).get('/links/detalhe')

    expect(resposta.status).toBe(200)
    expect(resposta.body.dados.acessos).toBe(0)
    expect(resposta.body.dados.urlCurta).toBe(body.dados.urlCurta)
  })

  it('responde 404 para um codigo inexistente', async () => {
    const resposta = await request(app).get('/links/naoexiste')

    expect(resposta.status).toBe(404)
  })
})

describe('DELETE /links/:codigo', () => {
  it('remove o link e responde 204 sem corpo', async () => {
    await criarLink({ url: 'https://exemplo.com', codigo: 'remover' })

    const resposta = await request(app).delete('/links/remover')

    expect(resposta.status).toBe(204)
    expect(resposta.body).toEqual({})
  })

  it('deixa de redirecionar apos a remocao', async () => {
    await criarLink({ url: 'https://exemplo.com', codigo: 'sumiu' })
    await request(app).delete('/links/sumiu')

    expect((await request(app).get('/sumiu')).status).toBe(404)
  })

  it('responde 404 ao remover um codigo inexistente', async () => {
    expect((await request(app).delete('/links/naoexiste')).status).toBe(404)
  })
})
