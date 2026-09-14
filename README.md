# Encurtador API

API REST de encurtamento de URLs, escrita em Node.js com Express.

Projeto desenvolvido ao longo da disciplina de DevOps: partindo do versionamento
no Git, passando por um fluxo de CI/CD no GitHub Actions e terminando com a
aplicacao empacotada em um container Docker.

## O que a API faz

Recebe uma URL longa, devolve um codigo curto e, ao acessar esse codigo,
redireciona para o destino original contabilizando o acesso.

```
POST /links  { "url": "https://exemplo.com/pagina/muito/longa" }
  -> 201  { "codigo": "k3fHb2q", "urlCurta": "http://localhost:3000/k3fHb2q", ... }

GET /k3fHb2q
  -> 302  Location: https://exemplo.com/pagina/muito/longa
```

## Rotas

| Metodo   | Rota             | Descricao                                          |
| -------- | ---------------- | -------------------------------------------------- |
| `GET`    | `/health`        | Estado da aplicacao (usado pelo HEALTHCHECK e pelo CI) |
| `POST`   | `/links`         | Cria um link curto                                  |
| `GET`    | `/links`         | Lista os links cadastrados                          |
| `GET`    | `/links/:codigo` | Detalhes de um link, sem contabilizar acesso        |
| `DELETE` | `/links/:codigo` | Remove um link                                      |
| `GET`    | `/:codigo`       | Redireciona para a URL original (302)               |

### Envelope de resposta

Toda resposta segue o mesmo formato, o que permite ao cliente tratar sucesso e
erro sem inspecionar o corpo caso a caso.

```jsonc
// sucesso
{ "sucesso": true, "dados": { }, "meta": { } }

// erro
{ "sucesso": false, "erro": { "codigo": "REQUISICAO_INVALIDA", "mensagem": "..." } }
```

### Criando um link com codigo personalizado

```bash
curl -X POST http://localhost:3000/links \
  -H 'Content-Type: application/json' \
  -d '{"url": "https://github.com", "codigo": "meu-github"}'
```

## Executando localmente

Requer Node.js 22 ou superior.

```bash
npm install
npm run dev          # com recarga automatica
npm start            # execucao normal
```

A API sobe em `http://localhost:3000`.

## Testes

```bash
npm test              # suite completa
npm run test:coverage # com relatorio de cobertura
npm run lint          # analise estatica com oxlint
```

A suite cobre as funcoes de validacao e geracao de codigo, o repositorio, o
tratamento de erros e o fluxo HTTP completo (criacao, listagem, redirect,
contagem de acessos e remocao).

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste se precisar. Todos os valores tem
padrao, entao a aplicacao sobe sem nenhuma configuracao.

| Variavel         | Padrao                  | Descricao                            |
| ---------------- | ----------------------- | ------------------------------------ |
| `PORT`           | `3000`                  | Porta em que a API escuta            |
| `URL_BASE`       | `http://localhost:PORT` | Base usada para montar o link curto  |
| `TAMANHO_CODIGO` | `7`                     | Tamanho do codigo gerado (4 a 12)    |

A configuracao e validada na inicializacao: um valor invalido derruba o processo
no ato, em vez de deixar a aplicacao subir num estado inconsistente.

## Estrutura

```
src/
├── app.js                  # montagem do Express
├── server.js               # inicializacao e encerramento gracioso
├── config/env.js           # configuracao validada na carga
├── lib/
│   ├── slug.js             # geracao do codigo curto
│   └── validacao.js        # validacao de URL e de codigo personalizado
├── middleware/
│   ├── errorHandler.js     # tratamento central de erros
│   └── notFound.js         # rotas nao mapeadas
├── modules/
│   ├── health/             # rota de estado
│   └── links/              # rotas, controller, service e repositorio
└── utils/
    ├── httpError.js        # erro com status e codigo estavel
    └── resposta.js         # envelope unico de resposta
```

O armazenamento e em memoria, atras de uma interface de repositorio. Trocar por
um banco significa reimplementar `links.repository.js`, sem tocar no service.

## Licenca

MIT
