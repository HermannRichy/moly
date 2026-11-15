import { verifyToken } from '@clerk/backend';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { createApp } from './create-app.js';
import { schema } from './db/schema.js';

const databaseUrl = process.env.DATABASE_URL;
const secretKey = process.env.CLERK_SECRET_KEY;
if (!databaseUrl) throw new Error('La variable DATABASE_URL est manquante.');
if (!secretKey) throw new Error('La variable CLERK_SECRET_KEY est manquante.');

const app = createApp({
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

export default app;
