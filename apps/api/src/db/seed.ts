import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from './client';
import { eventState, events, raffleNumbers, users } from './schema';

const TOTAL_NUMBERS = 2000;

async function seed() {
  // Ensure default demo user exists (id: 1)
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

  // Ensure default event exists (id: 1, slug: 'demo')
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

  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM "users"), 1));`,
  );
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('events', 'id'), COALESCE((SELECT MAX(id) FROM "events"), 1));`,
  );

  console.log(
    `Seed complete: user 1, event 1 (slug: demo), raffle_numbers 1..${TOTAL_NUMBERS} (idempotent).`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
