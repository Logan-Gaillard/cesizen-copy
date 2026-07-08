# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Installe toutes les dépendances (y compris native modules comme argon2)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:26-slim AS deps

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
# Stage 1b — prod-deps
# Installe UNIQUEMENT les dependencies de production (npm ci --omit=dev) :
# contient le client Prisma ET le CLI Prisma (tous deux dans "dependencies",
# pas "devDependencies"), avec la totalite de leurs dependances transitives
# (ex : `effect`, requis par @prisma/config mais absent de @prisma/*). Une
# copie partielle/manuelle de node_modules pour le CLI Prisma s'est revelee
# fragile a deux reprises (voir ERRORS.md n6 et n11) : npm est la seule source
# de verite fiable pour cette resolution.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:26-slim AS prod-deps

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder
# Génère le client Prisma et build l'application Next.js
# ─────────────────────────────────────────────────────────────────────────────
FROM node:26-slim AS builder

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
FROM node:26-slim AS runner

WORKDIR /app

# OpenSSL requis par Prisma à l'exécution
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# SHA du commit courant, injecte au build (utilise par /api/health).
# Root cause de l'incident du 2026-07-06 : cette variable n'etait jamais
# renseignee nulle part, ni ici ni dans la CI.
ARG GIT_COMMIT_SHA
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}

# Utilisateur non-root pour la sécurité
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Serveur standalone (server.js + node_modules minimal tracé par Next.js)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# CLI Prisma embarque pour que le conteneur applique ses propres migrations au
# demarrage (compatible avec un auto-update Watchtower, qui ne met a jour qu'un
# seul conteneur a la fois sans pouvoir orchestrer un service de migration
# separe). node_modules provient du stage prod-deps (npm ci --omit=dev) :
# c'est un ensemble COMPLET et coherent resolu par npm, pas une copie
# selective de dossiers devinee a la main.
COPY --from=builder /app/prisma                        ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

# Applique les migrations puis demarre le serveur standalone
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]