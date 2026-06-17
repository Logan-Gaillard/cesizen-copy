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

# Génère le client Prisma dans app/generated/
RUN npx prisma generate

# Build de production Next.js
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner (image finale, allégée)
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

# Artefacts de build Next.js
COPY --from=builder /app/.next         ./.next
COPY --from=builder /app/public        ./public

# Node modules avec les binaires natifs compilés
COPY --from=builder /app/node_modules  ./node_modules

# Prisma — schema, migrations et client généré
COPY --from=builder /app/prisma        ./prisma
COPY --from=builder /app/app/generated ./app/generated

# Fichiers de config nécessaires au démarrage
COPY --from=builder /app/package.json     ./package.json
COPY --from=builder /app/next.config.ts   ./next.config.ts
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json    ./tsconfig.json

# Droits sur les dossiers écrits par Next.js au runtime
RUN chown -R nextjs:nodejs /app/.next

USER nextjs

EXPOSE 3000

# Applique les migrations puis démarre le serveur
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]