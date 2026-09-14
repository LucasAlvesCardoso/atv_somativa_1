# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Estagio 1: dependencias
# Instalado em um estagio proprio para que a imagem final nao carregue o npm
# cache nem as dependencias de desenvolvimento (vitest, oxlint, supertest).
# ---------------------------------------------------------------------------
FROM node:24-alpine AS deps

WORKDIR /app

# Copiamos so os manifestos primeiro: enquanto eles nao mudarem, o Docker
# reaproveita a camada de instalacao e o build seguinte nao reinstala nada.
COPY package.json package-lock.json ./

# `npm ci` instala exatamente o que esta no lock, sem resolver versoes de novo.
RUN npm ci --omit=dev && npm cache clean --force

# ---------------------------------------------------------------------------
# Estagio 2: imagem final
# ---------------------------------------------------------------------------
FROM node:24-alpine AS runtime

LABEL org.opencontainers.image.title="encurtador-api" \
      org.opencontainers.image.description="API REST de encurtamento de URLs" \
      org.opencontainers.image.licenses="MIT"

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# A imagem node ja traz o usuario sem privilegios `node`. Rodar como root em um
# container e desnecessario aqui e amplia o estrago de uma eventual falha.
USER node

EXPOSE 3000

# O Docker usa este comando para marcar o container como healthy. Consultamos a
# propria rota /health com o fetch nativo do Node, sem instalar curl ou wget.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
