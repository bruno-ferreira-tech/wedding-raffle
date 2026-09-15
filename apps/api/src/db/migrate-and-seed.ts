import 'dotenv/config';
import { join } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './client';
import { eventState, events, raffleNumbers, users } from './schema';

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

  console.log('Ensuring default user, event, and 2000 numbers exist (idempotent seed)...');
  await db
    .insert(users)
    .values({
      id: 1,
      name: 'Noivos Demo',
      email: 'demo@corta-gravata.local',
      passwordHash:
        'c454e99f0e1f744e27f1c1f72782e4e16447be5fcf3f835b6c86a349bc1f2e10', // demo123
      role: 'couple',
    })
    .onConflictDoNothing();

  await db
    .insert(events)
    .values({
      id: 1,
      userId: 1,
      slug: 'demo',
      title: 'Casamento Bruno & Carol',
      coupleNames: 'Bruno & Carol',
      themeId: 'champagne-navy',
      totalNumbers: TOTAL_NUMBERS,
      ticketPriceCents: 2000,
      padrinhoPin: '1234',
    })
    .onConflictDoNothing();

  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => ({
    eventId: 1,
    id: i + 1,
  }));

  await db.insert(raffleNumbers).values(numbers).onConflictDoNothing();
  await db.insert(eventState).values({ id: 1 }).onConflictDoNothing();

  console.log(
    `Database setup complete: event 1 (demo) + raffle_numbers 1..${TOTAL_NUMBERS} ready.`,
  );
}

setup()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error('Database setup failed:', err);
    process.exit(1);
  });
