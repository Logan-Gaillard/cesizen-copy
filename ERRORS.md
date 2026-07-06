# Erreurs rencontrées pendant le TP DevOps

Toutes les erreurs ci-dessous sont **réelles**, rencontrées pendant la mise en place du pipeline CI/CD de CESIZEN (pas simulées), avec le message exact tel qu'observé dans les logs.

## 1. Husky configuré mais jamais réellement installé

**Étape** : Atelier 1.4 — Husky + Commitlint

**Contexte** : le commit `chore(ci): configure husky et commitlint` avait bien ajouté les hooks `.husky/*` et `commitlint.config.js`, mais jamais la dépendance `husky` elle-même dans `package.json`, ni le script `prepare`. Les hooks ne fonctionnaient que localement car `git config core.hooksPath` avait été réglé à la main, sans être versionné.

**Message observé** : aucune erreur explicite — le bug est silencieux : sur un clone frais ou en CI, les hooks ne se seraient jamais activés.

**Résolution** : `npm install --save-dev husky` + ajout du script `"prepare": "husky"` dans `package.json`, puis `npm run prepare` pour régénérer `core.hooksPath`.

## 2. Lockfile désynchronisé — `npm ci` échoue en CI mais pas en local

**Étape** : Atelier 3.4 — Premier push et analyse des logs

**Message exact** :
```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
npm error
npm error Missing: yaml@2.9.0 from lock file
```

**Cause racine** : `npm install <paquet>` ciblé (au lieu d'un `npm install` complet) sous **npm 11** (local) ne résout pas les dépendances transitives dupliquées (ex : `yaml`, `conventional-commits-parser`) de la même façon que **npm 10.8.2** (celui utilisé par les runners GitHub Actions sous Node 20/22). Le lockfile généré en local passait le `npm ci` local mais pas celui de la CI.

**Résolution** : régénérer systématiquement le lockfile dans un conteneur Docker `node:20` (même version de npm que la CI) après toute modification de `package.json`, puis valider avec `npm ci` avant de commit. Ce bug s'est reproduit plusieurs fois pendant la session (Atelier 3, Atelier 11) avant que cette pratique ne soit adoptée systématiquement.

## 3. `prisma generate` échoue en CI — `DATABASE_URL` non résolvable

**Étape** : Atelier 3.4

**Message exact** :
```
Failed to load config file "/home/runner/work/cesizen-copy/cesizen-copy" as a TypeScript/JavaScript module.
Error: PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL.
```

**Cause racine** : `prisma.config.ts` exige que `DATABASE_URL` soit résolvable dès le chargement (via `dotenv/config`), même pour un simple `prisma generate` qui ne se connecte à aucune base. Les jobs `quality` et `tests` ne définissaient pas cette variable (contrairement à `build`).

**Résolution** : injection d'une URL Postgres factice (`postgresql://ci:ci@localhost:5432/ci`) au niveau du step `npx prisma generate` dans les jobs concernés — `prisma generate` n'a besoin que d'une valeur syntaxiquement valide, pas d'une connexion réelle.

## 4. Node 18 incompatible avec Prisma 7

**Étape** : Atelier 3.2 — Matrix build

**Message exact** :
```
npm error │    Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+.    │
npm error │    Please upgrade your Node.js version.                            │
```

**Cause racine** : la matrice de test proposée par défaut (`[18, 20, 22]`) n'est pas compatible avec la version de Prisma réellement utilisée par CESIZEN.

**Résolution** : matrice changée en `[20, 22, 24]`, qui reflète les runtimes Node réellement supportés par le projet.

## 5. Vulnérabilité HIGH sur Next.js détectée par l'audit de sécurité

**Étape** : Atelier 4.2 — Job security

**Message** : `npm audit` remontait une vulnérabilité `HIGH` sur Next.js (CSRF bypass, DoS, cache poisoning — plusieurs CVE cumulées sur la plage de versions installée).

**Résolution** : mise à jour de `next` (16.1.6 → 16.2.10), une version mineure qui corrige la faille sans breaking change. Vérifié après coup avec `npm audit --audit-level=high` (exit code 0).

## 6. Image Docker standalone qui ne démarre pas — dépendances du CLI Prisma éparpillées

**Étape** : Atelier 9.4 — Prisma dans Docker

**Message exact** :
```
Error: Cannot find module 'effect'
Require stack:
- /app/node_modules/@prisma/config/dist/index.js
- /app/node_modules/prisma/build/index.js
```

**Cause racine** : en mode `output: "standalone"`, seuls les fichiers réellement importés par le code applicatif sont copiés dans l'image finale. Le CLI Prisma (nécessaire pour lancer les migrations) n'est jamais importé par le code — ses dépendances (dont le paquet `effect`, hors de `@prisma/`) manquaient donc à l'appel. Une première tentative de copie sélective des sous-paquets `@prisma/*` a échoué à plusieurs reprises (dépendances transitives imprévisibles).

**Résolution** : séparation des responsabilités — un service `migrate` dédié dans `docker-compose.yml`, basé sur le stage `builder` (node_modules complet), exécute les migrations ; l'image `runner` servie en production reste 100% standalone, sans aucun outillage Prisma CLI.

## 7. `semantic-release` bloqué par la protection de branche

**Étape** : Atelier 11.1 — Déclenchement de la première release

**Message exact** :
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: - Changes must be made through a pull request.
error: failed to push some refs to 'https://github.com/Logan-Gaillard/cesizen-copy'
```

**Cause racine** : le plugin `@semantic-release/git` tente de pousser directement un commit (bump de version + CHANGELOG.md) sur `main`, ce que la règle de protection de branche (configurée volontairement sans possibilité de bypass, Atelier 1.3) interdit — y compris pour le `GITHUB_TOKEN` de la CI.

**Résolution** : suppression des plugins `@semantic-release/git`, `@semantic-release/changelog` et `@semantic-release/npm` de `.releaserc.json`. Seuls `commit-analyzer`, `release-notes-generator` et `github` sont conservés : la release et le tag sont créés via l'API GitHub (sur `refs/tags/*`), sans toucher à la branche protégée. Compromis assumé : `package.json` n'est plus bumpé automatiquement.

## 8. `semantic-release` exige une version de Node non couverte par la CI

**Étape** : Atelier 11.1

**Message** :
```
npm warn EBADENGINE   package: 'semantic-release@25.0.5',
npm warn EBADENGINE   required: { node: '^22.14.0 || >= 24.10.0' },
npm warn EBADENGINE   current: { node: 'v20.20.2', npm: '10.8.2' }
```

**Résolution** : le job `release` utilisait Node 20 (comme les autres jobs `quality`/`build`) ; changé en Node 22 spécifiquement pour ce job.

## 9. Crash en production de `/api/health` — variable d'environnement jamais injectée

Voir [POSTMORTEM.md](./POSTMORTEM.md) pour le détail complet (chronologie, 5 pourquoi, stratégies de rollback).

**Message exact** :
```
TypeError: Cannot read properties of undefined (reading 'slice')
```

**Résolution** : optional chaining + valeur de repli, et injection réelle de `GIT_COMMIT_SHA` via `ARG`/`ENV` Docker et `build-args` CI.
