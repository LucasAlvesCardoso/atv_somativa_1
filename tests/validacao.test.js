import { describe, expect, it } from 'vitest'
import {
  TAMANHO_MAXIMO_URL,
  validarCodigoPersonalizado,
  validarUrl,
} from '../src/lib/validacao.js'

describe('validarUrl', () => {
  it('aceita uma URL http valida', () => {
    const resultado = validarUrl('http://exemplo.com/pagina')

    expect(resultado).toEqual({ valido: true, url: 'http://exemplo.com/pagina' })
  })

  it('aceita uma URL https com query string', () => {
    const resultado = validarUrl('https://exemplo.com/busca?q=devops')

    expect(resultado.valido).toBe(true)
  })

  it('remove espacos ao redor da URL antes de validar', () => {
    const resultado = validarUrl('  https://exemplo.com  ')

    expect(resultado).toEqual({ valido: true, url: 'https://exemplo.com' })
  })

  it('rejeita quando a url nao e um texto', () => {
    const resultado = validarUrl(42)

    expect(resultado.valido).toBe(false)
    expect(resultado.motivo).toMatch(/obrigatorio/)
  })

  it('rejeita texto vazio', () => {
    expect(validarUrl('   ').valido).toBe(false)
  })

  it('rejeita texto que nao e uma URL', () => {
    const resultado = validarUrl('isto nao e uma url')

    expect(resultado.valido).toBe(false)
    expect(resultado.motivo).toMatch(/nao e valida/)
  })

  it('rejeita o protocolo javascript para evitar XSS no redirect', () => {
    const resultado = validarUrl('javascript:alert(1)')

    expect(resultado.valido).toBe(false)
    expect(resultado.motivo).toMatch(/http ou https/)
  })

  it('rejeita o protocolo data', () => {
    expect(validarUrl('data:text/html,<script>alert(1)</script>').valido).toBe(false)
  })

  it('rejeita o protocolo file', () => {
    expect(validarUrl('file:///etc/passwd').valido).toBe(false)
  })

  it('rejeita URL acima do tamanho maximo', () => {
    const urlLonga = `https://exemplo.com/${'a'.repeat(TAMANHO_MAXIMO_URL)}`

    const resultado = validarUrl(urlLonga)

    expect(resultado.valido).toBe(false)
    expect(resultado.motivo).toMatch(/tamanho maximo/)
  })
})

describe('validarCodigoPersonalizado', () => {
  it('aceita um codigo alfanumerico', () => {
    expect(validarCodigoPersonalizado('meu-link_1')).toEqual({
      valido: true,
      codigo: 'meu-link_1',
    })
  })

  it('rejeita codigo com menos de 3 caracteres', () => {
    expect(validarCodigoPersonalizado('ab').valido).toBe(false)
  })

  it('rejeita codigo com mais de 32 caracteres', () => {
    expect(validarCodigoPersonalizado('a'.repeat(33)).valido).toBe(false)
  })

  it('rejeita codigo com caracteres fora do formato', () => {
    const resultado = validarCodigoPersonalizado('link com espaco')

    expect(resultado.valido).toBe(false)
    expect(resultado.motivo).toMatch(/3 a 32 caracteres/)
  })

  it('rejeita codigo que colidiria com uma rota da API', () => {
    const resultado = validarCodigoPersonalizado('health')

    expect(resultado.valido).toBe(false)
    expect(resultado.motivo).toMatch(/reservado/)
  })

  it('trata codigos reservados sem diferenciar maiusculas', () => {
    expect(validarCodigoPersonalizado('LINKS').valido).toBe(false)
  })

  it('rejeita valor que nao e texto', () => {
    expect(validarCodigoPersonalizado(null).valido).toBe(false)
  })
})
