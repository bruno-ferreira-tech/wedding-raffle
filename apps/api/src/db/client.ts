import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is required. Set it in apps/api/.env (see .env.example).',
    );
  }
  return url;
}

const queryClient = postgres(requireDatabaseUrl());

export const db = drizzle(queryClient, { schema });
