/**
 * Repositorio de links em memoria.
 *
 * A interface (salvar/buscarPorCodigo/listar/...) e a mesma que um repositorio
 * com banco exporia, entao trocar o armazenamento depois nao afeta o service.
 * Os registros sao congelados e toda atualizacao substitui o objeto anterior,
 * de modo que ninguem consiga alterar um link ja armazenado por referencia.
 */

const links = new Map()

export function salvar(link) {
  const registro = Object.freeze({ ...link })
  links.set(registro.codigo, registro)
  return registro
}

export function buscarPorCodigo(codigo) {
  return links.get(codigo) ?? null
}

export function existe(codigo) {
  return links.has(codigo)
}

export function listar() {
  return [...links.values()].toSorted((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

export function contar() {
  return links.size
}

/** Substitui o registro por uma copia com o acesso contabilizado. */
export function registrarAcesso(codigo, momento) {
  const link = links.get(codigo)
  if (!link) return null

  return salvar({ ...link, acessos: link.acessos + 1, ultimoAcessoEm: momento })
}

export function remover(codigo) {
  return links.delete(codigo)
}

/** Usado pelos testes para garantir isolamento entre casos. */
export function limpar() {
  links.clear()
}
