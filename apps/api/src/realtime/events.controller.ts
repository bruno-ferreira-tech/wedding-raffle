import { Controller, Inject, MessageEvent, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
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
  constructor(@Inject(EVENT_BUS) private readonly bus: EventBus) {}

  @Sse('events')
  stream(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      subscriber.next({
        data: { type: 'connected' },
      } as MessageEvent);

      const unsubs = SUBSCRIBED_EVENTS.map((eventName) =>
        this.bus.on(eventName, (payload) => {
          subscriber.next({
            data: { type: eventName, ...payload },
          } as MessageEvent);
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
