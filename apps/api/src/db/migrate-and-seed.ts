import 'dotenv/config';
import { join } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './client';
import { eventState, raffleNumbers } from './schema';

const TOTAL_NUMBERS = 2000;

async function setup() {
  console.log('Running database migrations...');
  const migrationsFolder = join(__dirname, '..', '..', 'drizzle');
  try {
    await migrate(db, { migrationsFolder });
    console.log('Migrations applied successfully.');
  } catch (err) {
    console.warn('Migration note (tables may already exist):', err);
  }

  console.log('Ensuring 2000 numbers and event state exist (idempotent seed)...');
  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => ({
    id: i + 1,
  }));

  await db.insert(raffleNumbers).values(numbers).onConflictDoNothing();
  await db.insert(eventState).values({ id: 1 }).onConflictDoNothing();

  console.log(
    `Database setup complete: raffle_numbers 1..${TOTAL_NUMBERS} + event_state ready.`,
  );
}

setup()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Database setup failed:', err);
    process.exit(1);
  });
