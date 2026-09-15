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

## Executando com Docker

```bash
docker build -t encurtador-api .
docker run -d --name encurtador -p 3000:3000 encurtador-api

docker ps                                    # confere que o container esta de pe
curl http://localhost:3000/health            # confere que a aplicacao responde
```

Para encerrar:

```bash
docker rm -f encurtador
```

### Como a imagem foi montada

- **Build em dois estagios.** As dependencias sao instaladas em um estagio
  separado, de modo que a imagem final nao carrega o cache do npm nem as
  dependencias de desenvolvimento.
- **Camadas em ordem de estabilidade.** Os manifestos sao copiados antes do
  codigo: enquanto `package-lock.json` nao mudar, o Docker reaproveita a camada
  de instalacao e o build seguinte nao reinstala nada.
- **Usuario sem privilegios.** O processo roda como `node`, nao como root.
- **Healthcheck proprio.** O container consulta a rota `/health` com o `fetch`
  nativo do Node, sem precisar instalar `curl` ou `wget` na imagem.
- **Encerramento limpo.** A aplicacao trata `SIGTERM`, entao `docker stop`
  finaliza as conexoes em andamento em vez de esperar o timeout e receber um
  `SIGKILL`.

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

## CI/CD

Tres workflows no GitHub Actions:

**`CI`** — roda em toda pull request e em todo push para `main`:

1. Lint e testes com cobertura, em Node 22 e 24.
2. Build da imagem Docker, subida do container e teste de fumaca: confere
   `/health`, cria um link e valida que o redirect aponta para o destino certo.

**`CD`** — constroi a imagem para `linux/amd64` e `linux/arm64`:

- Em pull request, apenas constroi (validacao, sem publicar).
- Em push para `main` ou em tag `v*`, publica no **GHCR** e, se o secret
  `DOCKERHUB_USERNAME` estiver configurado, tambem no **Docker Hub**.

Para publicar no Docker Hub, configure em *Settings > Secrets and variables >
Actions*:

| Secret               | Conteudo                            |
| -------------------- | ----------------------------------- |
| `DOCKERHUB_USERNAME` | Seu usuario do Docker Hub           |
| `DOCKERHUB_TOKEN`    | Um access token gerado no Docker Hub |

Sem esses secrets o workflow continua verde, publicando somente no GHCR.

**`Alerta no Discord`** — workflow reutilizavel chamado pelo CI e pelo CD ao
final de cada execucao. Envia ao Discord o resultado do fluxo, com o autor, o
commit e o link para a execucao.

O alerta dispara com `always()`, entao a falha tambem e avisada: um alerta que
so notifica quando tudo deu certo nao serve para nada.

Para receber os alertas, crie um webhook no Discord (*Configuracoes do canal >
Integracoes > Webhooks*) e guarde a URL como secret:

| Secret            | Conteudo                        |
| ----------------- | ------------------------------- |
| `DISCORD_WEBHOOK` | A URL do webhook do seu canal   |

Sem esse secret os workflows continuam verdes: o passo registra que o webhook
nao esta configurado e segue, porque um aviso nao pode derrubar o pipeline.

### Consumindo a imagem publicada

```bash
docker run -d -p 3000:3000 ghcr.io/<usuario>/<repositorio>:latest
```

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
