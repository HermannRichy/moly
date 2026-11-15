import { verifyToken } from '@clerk/backend';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { Hono } from 'hono';

import { createApp } from './create-app.js';
import { schema } from './db/schema.js';

type Inner = ReturnType<typeof createApp>;
let inner: Inner | null = null;

/** Construit l'application à la première requête, pour ne rien exiger des variables au chargement. */
function build(): Inner | string[] {
  const databaseUrl = process.env.DATABASE_URL;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const missing = [!databaseUrl && 'DATABASE_URL', !secretKey && 'CLERK_SECRET_KEY'].filter((name): name is string => Boolean(name));
  if (!databaseUrl || !secretKey) return missing;
  return createApp({
    db: drizzle(neon(databaseUrl), { schema }),
    authenticate: async (token) => {
      try {
        const payload = await verifyToken(token, { secretKey });
        return payload.sub ?? null;
      } catch {
        return null;
      }
    },
  });
}

const app = new Hono();

app.all('*', (c) => {
  if (!inner) {
    const built = build();
    if (Array.isArray(built)) {
      return c.json({ error: "Configuration incomplète : variables d'environnement manquantes.", missing: built }, 500);
    }
    inner = built;
  }
  return inner.fetch(c.req.raw);
});

export default app;
