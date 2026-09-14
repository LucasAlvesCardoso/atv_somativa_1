import { beforeEach, describe, expect, it } from 'vitest'
import * as repositorio from '../src/modules/links/links.repository.js'

const LINK_BASE = Object.freeze({
  codigo: 'abc123',
  url: 'https://exemplo.com',
  acessos: 0,
  criadoEm: '2026-01-01T00:00:00.000Z',
  ultimoAcessoEm: null,
})

beforeEach(() => repositorio.limpar())

describe('repositorio de links', () => {
  it('salva e recupera um link pelo codigo', () => {
    repositorio.salvar(LINK_BASE)

    expect(repositorio.buscarPorCodigo('abc123')).toMatchObject({ url: 'https://exemplo.com' })
  })

  it('devolve null quando o codigo nao existe', () => {
    expect(repositorio.buscarPorCodigo('inexistente')).toBeNull()
  })

  it('congela o registro salvo para impedir alteracao por referencia', () => {
    const salvo = repositorio.salvar(LINK_BASE)

    expect(Object.isFrozen(salvo)).toBe(true)
  })

  it('nao altera o objeto recebido ao registrar um acesso', () => {
    const salvo = repositorio.salvar(LINK_BASE)

    repositorio.registrarAcesso('abc123', '2026-01-02T00:00:00.000Z')

    expect(salvo.acessos).toBe(0)
    expect(repositorio.buscarPorCodigo('abc123').acessos).toBe(1)
  })

  it('devolve null ao registrar acesso em codigo inexistente', () => {
    expect(repositorio.registrarAcesso('inexistente', '2026-01-02T00:00:00.000Z')).toBeNull()
  })

  it('lista os links do mais recente para o mais antigo', () => {
    repositorio.salvar({ ...LINK_BASE, codigo: 'antigo', criadoEm: '2026-01-01T00:00:00.000Z' })
    repositorio.salvar({ ...LINK_BASE, codigo: 'novo', criadoEm: '2026-06-01T00:00:00.000Z' })

    expect(repositorio.listar().map((link) => link.codigo)).toEqual(['novo', 'antigo'])
  })

  it('conta os links armazenados', () => {
    repositorio.salvar(LINK_BASE)
    repositorio.salvar({ ...LINK_BASE, codigo: 'outro' })

    expect(repositorio.contar()).toBe(2)
  })

  it('remove um link existente e informa o resultado', () => {
    repositorio.salvar(LINK_BASE)

    expect(repositorio.remover('abc123')).toBe(true)
    expect(repositorio.remover('abc123')).toBe(false)
  })
})
