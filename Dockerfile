# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Installe toutes les dépendances (y compris native modules comme argon2)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

# argon2 est un module natif qui nécessite des outils de compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm install

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder
# Génère le client Prisma et build l'application Next.js
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Récupère les node_modules compilés du stage précédent
COPY --from=deps /app/node_modules ./node_modules

# Copie tout le code source
COPY . .

# DATABASE_URL n'a besoin que d'être resolvable pour `prisma generate`/`next build`
# (aucune connexion reelle requise) : la vraie valeur est injectee au runtime.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# Génère le client Prisma dans app/generated/
RUN npx prisma generate

# Build de production Next.js
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner (image finale, allégée)
# S'appuie sur next.config.ts `output: "standalone"` : Next.js ne copie que les
# fichiers et node_modules réellement utilisés au runtime (arbre bien plus léger
# que node_modules complet).
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# OpenSSL requis par Prisma à l'exécution
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Utilisateur non-root pour la sécurité
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Serveur standalone (server.js + node_modules minimal tracé par Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# Note : le CLI Prisma (pour `migrate deploy`) n'est PAS embarque ici. Ses
# dependances transitives (@prisma/config -> effect, etc.) sont eparpillees
# hors de @prisma/ dans l'arbre complet et rendent une copie partielle fragile.
# Les migrations tournent dans un service dedie base sur le stage `builder`
# (voir docker-compose.yml), qui a deja tout node_modules necessaire.

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]