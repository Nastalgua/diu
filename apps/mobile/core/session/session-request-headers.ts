import { localCalendarDay } from '@/core/session/session-feed-storage';

export function sessionRequestHeaders(now: number = Date.now()): HeadersInit {
  return {
    'X-Local-Calendar-Day': localCalendarDay(now),
  };
}
