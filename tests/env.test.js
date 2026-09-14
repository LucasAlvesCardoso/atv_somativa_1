import { describe, expect, it } from 'vitest'
import { carregarEnv } from '../src/config/env.js'

describe('carregarEnv', () => {
  it('aplica os valores padrao quando nada e informado', () => {
    const env = carregarEnv({})

    expect(env.PORT).toBe(3000)
    expect(env.URL_BASE).toBe('http://localhost:3000')
    expect(env.TAMANHO_CODIGO).toBe(7)
    expect(env.NODE_ENV).toBe('development')
  })

  it('deriva a URL_BASE a partir da porta informada', () => {
    expect(carregarEnv({ PORT: '8080' }).URL_BASE).toBe('http://localhost:8080')
  })

  it('respeita a URL_BASE explicita', () => {
    const env = carregarEnv({ URL_BASE: 'https://curto.exemplo.com' })

    expect(env.URL_BASE).toBe('https://curto.exemplo.com')
  })

  it('marca IS_TEST quando o ambiente e de teste', () => {
    expect(carregarEnv({ NODE_ENV: 'test' }).IS_TEST).toBe(true)
    expect(carregarEnv({ NODE_ENV: 'production' }).IS_TEST).toBe(false)
  })

  it('devolve um objeto congelado para que a configuracao nao mude em execucao', () => {
    expect(Object.isFrozen(carregarEnv({}))).toBe(true)
  })

  it('falha quando a porta nao e um numero inteiro', () => {
    expect(() => carregarEnv({ PORT: 'abc' })).toThrow(/PORT/)
  })

  it('falha quando a porta esta fora da faixa valida', () => {
    expect(() => carregarEnv({ PORT: '0' })).toThrow(/entre 1 e 65535/)
    expect(() => carregarEnv({ PORT: '70000' })).toThrow(/entre 1 e 65535/)
  })

  it('falha quando o tamanho do codigo esta fora da faixa valida', () => {
    expect(() => carregarEnv({ TAMANHO_CODIGO: '3' })).toThrow(/TAMANHO_CODIGO/)
    expect(() => carregarEnv({ TAMANHO_CODIGO: '13' })).toThrow(/TAMANHO_CODIGO/)
  })
})
