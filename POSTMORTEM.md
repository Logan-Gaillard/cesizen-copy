# Post-mortem — Crash de `/api/health` en production

## En-tête

- **Date** : 2026-07-06
- **Sévérité** : P2 (fonctionnalité d'observabilité non critique, aucune donnée utilisateur affectée, endpoint jamais exposé en production réelle)
- **Durée de l'incident** : 0 minute en production — bug intercepté avant mise en production (voir chronologie)
- **Auteur** : Logan Gaillard

## Chronologie

| Heure | Événement |
|---|---|
| J | Ajout du champ `commitSha` à `/api/health`, lu depuis `process.env.GIT_COMMIT_SHA` en production, sur la branche `feature/deploy-observability` |
| J | `npm test` et `npm run build` passent sans erreur (voir Cause racine) |
| J | Test manuel de l'image en mode production (`NODE_ENV=production next start`) — crash immédiat : `TypeError: Cannot read properties of undefined (reading 'slice')` |
| J | Bug reproduit et confirmé sur `/api/health` |
| J | Test de régression écrit (rouge), reproduisant exactement l'erreur observée |
| J | Correctif appliqué sur la branche `fix/commit-sha-undefined` |
| J | Test de régression passe (vert), 76/76 tests OK |
| J | Cause racine corrigée : `GIT_COMMIT_SHA` injecté via `ARG`/`ENV` dans le `Dockerfile` et `build-args` dans le job `docker` de la CI |

Le bug n'a **jamais atteint un environnement de production réel** : il a été intercepté lors du test manuel du mode `production` en local, avant le merge vers `develop`/`main`.

## Cause racine

Le code lisait `process.env.GIT_COMMIT_SHA` avec un assertion non-null (`!`) en supposant que cette variable serait toujours injectée en production — alors qu'elle n'était renseignée nulle part : ni dans le `Dockerfile`, ni dans `docker-compose.yml`, ni dans le pipeline CI.

### Pourquoi le CI (tests, build, lint) n'a pas détecté le bug

`npm test` et `npm run build` sont exécutés avec `NODE_ENV` différent de `"production"` (Vitest force `NODE_ENV=test`, `next build` ne l'exécute pas non plus). Or le code buggé est protégé par une condition `if (process.env.NODE_ENV === "production")` : la branche fautive n'était donc **jamais exécutée** ni par les tests, ni par le build. TypeScript ne pouvait pas non plus le détecter puisque `process.env.GIT_COMMIT_SHA` est typé `string | undefined`, et l'opérateur `!` supprime volontairement cette vérification.

### 5 pourquoi

1. **Pourquoi l'endpoint a-t-il crashé ?** → `GIT_COMMIT_SHA` était `undefined` et le code appelait `.slice()` dessus sans vérification.
2. **Pourquoi cette variable était-elle `undefined` ?** → Elle n'était injectée nulle part dans la chaîne de build/déploiement (Dockerfile, docker-compose, CI).
3. **Pourquoi personne ne l'a remarqué en développant la fonctionnalité ?** → Le code ne s'exécute que si `NODE_ENV === "production"`, jamais atteint en développement local (`next dev` utilise `"development"`).
4. **Pourquoi les tests automatisés ne l'ont pas attrapé ?** → Vitest tourne toujours avec `NODE_ENV=test` ; aucun test n'exerçait spécifiquement la branche "production" du code.
5. **Pourquoi n'y avait-il pas de test couvrant ce cas avant l'incident ?** → Le test initial de `/api/health` couvrait uniquement le comportement par défaut (dev), pas les branches conditionnelles liées à l'environnement — un angle mort classique des tests unitaires sur du code environnement-dépendant.

## Impact

- **Indisponibilité réelle** : aucune (bug jamais déployé)
- **MTTR mesuré** : sans objet (pas d'incident réel), voir ci-dessous pour les stratégies de rollback qui auraient été utilisées
- **Pilier CALMS concerné** : *Measurement* — l'absence de test sur le comportement spécifique à l'environnement de production est ce qui aurait laissé passer ce bug jusqu'en prod sans le test manuel effectué en amont

### Stratégies de rollback disponibles (si l'incident avait atteint la production)

| Stratégie | Procédure | MTTR estimé | Remarque |
|---|---|---|---|
| 1. Rollback image Docker | `docker compose pull` d'un tag GHCR antérieur (ex : `sha-xxxxxx` du commit précédent) + `docker compose up -d` | ~1-2 min | Le plus rapide : pas de rebuild, juste re-pull d'une image déjà validée. Mesuré sur ce projet : un `docker compose up` avec image déjà en cache local prend quelques secondes. |
| 2. `git revert` + push + CI complète | Revert du commit fautif sur `main`, push, attente du pipeline complet (lint, tests, build, docker, release) | ~6-9 min | Basé sur les durées réellement observées de ce pipeline pendant cette session (job `docker` seul : 4-6 min) |
| 3. Hotfix direct | Branche `fix/`, correction ciblée, PR, merge | Mesuré ici : quelques minutes (test rouge → fix → test vert) | Le plus adapté quand la cause est identifiée rapidement, comme dans ce cas |

**Méthode recommandée** : le rollback d'image Docker (stratégie 1) reste la plus rapide en cas d'urgence réelle, car elle ne dépend pas du pipeline CI. Le hotfix (stratégie 3) est préférable quand, comme ici, le correctif est trivial et qu'on veut éviter de re-déployer une version connue pour être bancale sur d'autres points.

## Actions correctives

**Déjà fait :**
- Correctif appliqué avec optional chaining + valeur de repli (`?? "unknown"`) au lieu d'une assertion non-null
- `GIT_COMMIT_SHA` désormais injecté correctement (Dockerfile `ARG`/`ENV` + `build-args` CI)
- Test de régression ajouté, exécutant explicitement la branche `NODE_ENV=production`
- Script `scripts/smoke-test.mjs` ajouté pour vérifier `/api/health` après déploiement

**À faire (recommandations) :**
- Généraliser la pratique de tester le mode `production` localement (`next build && NODE_ENV=production node .next/standalone/server.js`) avant tout merge touchant au code sensible à l'environnement
- Envisager un lint rule ou une revue systématique des usages de `!` (non-null assertion) sur des variables d'environnement

## Leçon

Le code conditionné par `NODE_ENV` est un angle mort classique des tests automatisés : si aucun test n'exécute explicitement la branche "production", elle peut cacher des bugs indéfiniment. Ce projet ajoute désormais un test dédié à chaque nouvelle branche liée à l'environnement dans du code d'observabilité (`/api/health`, `/api/metrics`).
