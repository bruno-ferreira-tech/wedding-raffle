import { Controller, Inject, MessageEvent, Query, Sse } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { Observable } from 'rxjs';
import { DB, type Db } from '../db/db.module';
import { events } from '../db/schema';
import {
  EVENT_BUS,
  type EventBus,
  type RealtimeEventName,
} from './bus';

const HEARTBEAT_MS = 15_000;

const SUBSCRIBED_EVENTS: RealtimeEventName[] = [
  'order.reserved',
  'sale.completed',
  'sales.updated',
  'draw.winner',
];

@Controller()
export class EventsController {
  constructor(
    @Inject(EVENT_BUS) private readonly bus: EventBus,
    @Inject(DB) private readonly db: Db,
  ) {}

  @Sse('events')
  stream(
    @Query('slug') slug?: string,
    @Query('eventId') eventIdQuery?: string,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      subscriber.next({
        data: { type: 'connected' },
      } as MessageEvent);

      let targetEventId: number | null = null;
      if (eventIdQuery && /^\d+$/.test(eventIdQuery)) {
        targetEventId = Number(eventIdQuery);
      }

      const initPromise = (async () => {
        if (!targetEventId && slug) {
          const [ev] = await this.db
            .select({ id: events.id })
            .from(events)
            .where(eq(events.slug, slug))
            .limit(1);
          if (ev) {
            targetEventId = ev.id;
          }
        }
      })();

      const unsubs = SUBSCRIBED_EVENTS.map((eventName) =>
        this.bus.on(eventName, (payload: any) => {
          void initPromise.then(() => {
            // If targetEventId is configured, only emit events matching that wedding
            if (
              targetEventId != null &&
              payload?.eventId != null &&
              payload.eventId !== targetEventId
            ) {
              return;
            }

            subscriber.next({
              data: { type: eventName, ...payload },
            } as MessageEvent);
          });
        }),
      );

      const heartbeat = setInterval(() => {
        subscriber.next({
          data: { type: 'heartbeat' },
        } as MessageEvent);
      }, HEARTBEAT_MS);

      return () => {
        for (const off of unsubs) {
          off();
        }
        clearInterval(heartbeat);
      };
    });
  }
}
