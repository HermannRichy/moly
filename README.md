# MOLY

Rappels quotidiens de grammaire, de conjugaison et d'orthographe, et expressions pour un français soutenu.

## Structure

- `apps/mobile` : application Expo (Expo Router, TypeScript), compatible Expo Go. Connexion avec Clerk.
- `apps/api` : API Hono déployée sur Vercel, base PostgreSQL (Neon) via Drizzle.

## Commandes

```bash
pnpm install        # à la première installation, ou quand une dépendance change
pnpm mobile         # démarre Expo
pnpm typecheck      # vérifie les types de l'app et de l'API
pnpm test           # lance les tests de l'API
```

## Configuration

- `apps/mobile/src/config.ts` : clé publique Clerk et adresse de l'API.
- Variables d'environnement de l'API (sur Vercel) : `DATABASE_URL`, `CLERK_SECRET_KEY`.

Les tables sont créées et le contenu importé au premier appel de l'API ; pour réimporter
le contenu après une modification, incrémenter `CONTENT_VERSION` dans `apps/api/src/db/migrate.ts`.

## Publication

Chaque push sur `main` publie une mise à jour Expo (`apps/mobile/.eas/workflows/publier.yml`).
