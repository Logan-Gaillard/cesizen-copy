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
# demarrage. Copie complete de @prisma/* : le CLI a des dependances transitives
# (@prisma/config -> effect, etc.) eparpillees hors de @prisma/, ce qui rend
# une copie partielle fragile (voir ERRORS.md). Choix assume : image plus
# lourde (~600 Mo) mais conteneur autonome, compatible avec un auto-update
# Watchtower en production (qui ne sait mettre a jour qu'un seul conteneur a
# la fois, sans orchestrer un service de migration separe).
COPY --from=builder /app/prisma        ./prisma
COPY --from=builder /app/node_modules/prisma  ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

# Applique les migrations puis demarre le serveur standalone
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]