import 'dotenv/config';

import { db } from './client';
import { eventState, raffleNumbers } from './schema';

const TOTAL_NUMBERS = 2000;

async function seed() {
  const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => ({
    id: i + 1,
  }));

  await db.insert(raffleNumbers).values(numbers).onConflictDoNothing();
  await db.insert(eventState).values({ id: 1 }).onConflictDoNothing();

  console.log(
    `Seed complete: raffle_numbers 1..${TOTAL_NUMBERS} + event_state (idempotent).`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
