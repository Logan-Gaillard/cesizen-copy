# Contribuer à CESIZEN

## Branches

Le projet suit GitFlow :
- `main` — code en production, toujours stable
- `develop` — branche d'intégration, base de toutes les features
- `feature/nom-de-la-feature` — nouvelle fonctionnalité, partie de `develop`
- `fix/nom-du-bug` — correction non urgente, partie de `develop`
- `hotfix/nom-du-bug` — correction urgente en production, partie de `main`
- `chore/nom-de-la-tache` — maintenance (deps, config, nettoyage)

Aucun push direct sur `main` ou `develop` : tout passe par une Pull Request.

## Commits (Conventional Commits)

Format : `type(scope): description`

Types autorisés : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Scopes du projet :

| Scope | Module |
|---|---|
| auth | Comptes utilisateurs |
| infos | Actualités & conseils |
| respiration | Exercices de respiration |
| admin | Espace administrateur |
| ui | Composants partagés |
| db | Schéma Prisma / migrations |
| ci | Pipeline CI/CD |
| docker | Conteneurisation |
| iac | Infrastructure as Code |
| deps | Dépendances |

Les commits sont validés automatiquement par Husky + Commitlint : un commit mal formaté est rejeté.

## Pull Requests

1. Crée ta branche depuis `develop` (ou `main` pour un hotfix).
2. Pousse ta branche et ouvre une PR vers `develop`.
3. La CI doit passer au vert (lint, tests, build) avant tout merge.
4. Une review est recommandée avant de merger.

### Checklist de review

- Le code respecte les conventions du projet (lint sans erreur)
- Les nouvelles fonctions métier ont des tests
- Aucun secret ou clé en dur dans le code
- Le schéma Prisma n'a pas été modifié sans migration associée

## Contraintes spécifiques au projet

- **Prisma** : le client généré vit dans `app/generated/`, qui est ignoré par git. Après chaque `git pull` qui touche `prisma/schema.prisma`, lance `npx prisma generate` avant de redémarrer le serveur de dev. Toute modification de schéma doit être accompagnée d'une migration (`npx prisma migrate dev --name nom_de_la_migration`).
- **Next.js App Router** : les composants sont `"use client"` par défaut dans ce projet ; les actions serveur (`actions/*.ts`) sont marquées `"use server"`. Ne mélange pas la logique d'accès DB dans un composant client.
- **Variables d'environnement** : `DATABASE_URL` est la seule variable sensible actuellement. Elle vit dans `.env.local` (jamais commité) en local, et dans GitHub Secrets / Vercel Environment Variables ailleurs.