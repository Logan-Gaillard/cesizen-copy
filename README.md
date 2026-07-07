# CESIZEN

[![CI](https://github.com/Logan-Gaillard/cesizen-copy/actions/workflows/ci.yml/badge.svg)](https://github.com/Logan-Gaillard/cesizen-copy/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Logan-Gaillard/cesizen-copy)](https://github.com/Logan-Gaillard/cesizen-copy/releases)
[![License](https://img.shields.io/github/license/Logan-Gaillard/cesizen-copy)](https://github.com/Logan-Gaillard/cesizen-copy/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Logan-Gaillard/cesizen-copy)](https://github.com/Logan-Gaillard/cesizen-copy/commits/main)

CESIZEN est une plateforme numérique de prévention et d'accompagnement autour de la santé mentale, portée dans un contexte simulé du Ministère de la Santé et de la Prévention. Elle permet aux utilisateurs de s'informer sur le stress, de s'auto-évaluer et de se détendre via des exercices interactifs (respiration, cohérence cardiaque).

Ce dépôt contient l'application ainsi que l'intégralité de sa chaîne DevOps : intégration continue, tests automatisés, conteneurisation, gestion des releases et infrastructure.

## Stack technique

| Composant | Technologie |
|---|---|
| Framework web | Next.js 16 (React, App Router, Server Actions) |
| Base de données | PostgreSQL via Prisma ORM (`@prisma/adapter-pg`) |
| Authentification | Sessions par cookie, mots de passe hachés avec argon2id |
| UI | HeroUI, MUI, styled-components, Tailwind CSS |
| Tests | Vitest (+ couverture v8) |
| Qualité | ESLint, Husky, Commitlint |
| Conteneurisation | Docker multi-stage (mode `standalone`), Docker Compose |
| CI/CD | GitHub Actions |
| Registre d'images | GitHub Container Registry (GHCR) |
| Gestion des versions | semantic-release |

## Démarrage local

### Sans Docker

```bash
npm install
cp .env.example .env.local   # renseigner DATABASE_URL
npx prisma migrate deploy
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Avec Docker Compose — développement (hot-reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Le code source est monté en volume : les modifications sont prises en compte à la volée. La base PostgreSQL est exposée sur `localhost:5432` pour le débogage.

### Avec Docker Compose — production (image standalone)

```bash
docker compose up --build -d
```

Les migrations Prisma tournent dans un service dédié (`migrate`) avant le démarrage de l'application ; l'image servie ne contient que le strict nécessaire au runtime (mode `output: "standalone"` de Next.js).

```bash
docker compose down      # arrête les conteneurs, conserve les données
docker compose down -v   # arrête les conteneurs et supprime les volumes (reset complet)
```

## Pipeline CI/CD

```
push / pull_request
        │
        ├── quality (lint)  ─┐
        ├── tests (Node 20/22/24, matrice)  ├─→ build ──┐
        └── security (npm audit)  ──────────┘           │
                                                          ├─→ docker (build + push GHCR) ──→ release (semantic-release, main uniquement)
                                                          │
```

- **quality / tests / security** tournent en parallèle
- **build** et **docker** attendent que les trois soient au vert
- **release** ne se déclenche que sur un push réel vers `main`, et crée automatiquement un tag + une release GitHub selon les [Conventional Commits](https://www.conventionalcommits.org/)

## Métriques DORA (mesurées sur ce dépôt)

| Métrique | Valeur mesurée | Niveau |
|---|---|---|
| Deployment Frequency | 26 commits sur `main` depuis le début du projet | En amélioration continue |
| Lead Time for Changes | Build + tests + Docker : ~5-8 min de bout en bout | Elite/High selon la charge des runners GitHub |
| Releases | 1 release (`v1.0.0`), automatisée via semantic-release | — |
| Change Failure Rate | 1 incident détecté avant mise en production (voir [POSTMORTEM.md](./POSTMORTEM.md)), 0 rollback nécessaire en prod | — |

## Branches et conventions de commits

Le projet suit [GitFlow](./CONTRIBUTING.md#branches) : `main` (production) ← `develop` (intégration) ← `feature/*` / `fix/*`.

Les commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org/), validée automatiquement par Husky + Commitlint. Détail complet des scopes, du processus de PR et de la checklist de review dans [CONTRIBUTING.md](./CONTRIBUTING.md).

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) — workflow Git, conventions de commits, checklist de PR
- [POSTMORTEM.md](./POSTMORTEM.md) — analyse du dernier incident détecté
- [ERRORS.md](./ERRORS.md) — erreurs réelles rencontrées pendant la mise en place du pipeline et leur résolution

## Arborescence simplifiée

```
cesizen/
├── .github/workflows/ci.yml   # pipeline CI/CD
├── app/                       # routes Next.js (App Router) + API
│   ├── api/health/            # endpoint de santé
│   └── ...
├── actions/                   # Server Actions (auth, contenus)
├── context/                   # hooks React de gestion d'état
├── prisma/                    # schéma et migrations
├── scripts/                   # scripts utilitaires (smoke test)
├── __tests__/                 # tests unitaires Vitest
├── Dockerfile                 # build multi-stage (deps → builder → runner)
├── docker-compose.yml         # stack de production locale
├── docker-compose.dev.yml     # stack de développement (hot-reload)
├── .releaserc.json            # configuration semantic-release
├── POSTMORTEM.md
└── ERRORS.md
```
