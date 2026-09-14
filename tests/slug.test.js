import { describe, expect, it } from 'vitest'
import { ALFABETO, gerarCodigo } from '../src/lib/slug.js'

describe('gerarCodigo', () => {
  it('gera um codigo com o tamanho solicitado', () => {
    expect(gerarCodigo(7)).toHaveLength(7)
  })

  it('usa apenas caracteres do alfabeto definido', () => {
    const codigo = gerarCodigo(32)

    for (const caractere of codigo) {
      expect(ALFABETO).toContain(caractere)
    }
  })

  it('nao usa caracteres ambiguos', () => {
    for (const ambiguo of ['0', 'O', '1', 'l', 'I']) {
      expect(ALFABETO).not.toContain(ambiguo)
    }
  })

  it('gera codigos diferentes em chamadas sucessivas', () => {
    const codigos = new Set(Array.from({ length: 200 }, () => gerarCodigo(8)))

    expect(codigos.size).toBe(200)
  })

  it('lanca erro quando o tamanho nao e um inteiro positivo', () => {
    expect(() => gerarCodigo(0)).toThrow(/invalido/)
    expect(() => gerarCodigo(-1)).toThrow(/invalido/)
    expect(() => gerarCodigo(2.5)).toThrow(/invalido/)
  })
})
