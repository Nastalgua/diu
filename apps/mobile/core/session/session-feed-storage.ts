import type { TFeedStackItem } from '@/core/components/feed-card/fake-data';

export type SessionSnapshot = {
  sessionId: string;
  stack: TFeedStackItem[];
  cursor: string | null;
  hasMore: boolean;
  resumeIndex: number;
  lastActiveAt: number;
  calendarDay: string;
};

export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export type SessionFeedStorage = {
  load(): Promise<SessionSnapshot | null>;
  save(snapshot: SessionSnapshot): Promise<void>;
  clear(): Promise<void>;
};

const SNAPSHOT_KEY = 'diu.session-feed.snapshot';

/** Idle gap after which a persisted session is treated as stale and a new one starts. */
export const SESSION_STALE_MS = 4 * 60 * 60 * 1000; // 4 hours

export function localCalendarDay(timestamp: number = Date.now()): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

export function isResumableSnapshot(
  snapshot: SessionSnapshot,
  now: number = Date.now()
): boolean {
  if (snapshot.calendarDay !== localCalendarDay(now)) {
    return false;
  }

  return now - snapshot.lastActiveAt <= SESSION_STALE_MS;
}

function isSessionSnapshot(value: unknown): value is SessionSnapshot {
  if (!value || typeof value !== 'object') return false;

  const snapshot = value as SessionSnapshot;

  return (
    typeof snapshot.sessionId === 'string' &&
    Array.isArray(snapshot.stack) &&
    (snapshot.cursor === null || typeof snapshot.cursor === 'string') &&
    typeof snapshot.hasMore === 'boolean' &&
    typeof snapshot.resumeIndex === 'number' &&
    typeof snapshot.lastActiveAt === 'number' &&
    typeof snapshot.calendarDay === 'string'
  );
}

export function createSessionFeedStorage(
  store: KeyValueStore
): SessionFeedStorage {
  return {
    async load() {
      const raw = await store.getItem(SNAPSHOT_KEY);
      if (!raw) return null;

      try {
        const parsed: unknown = JSON.parse(raw);
        return isSessionSnapshot(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    async save(snapshot) {
      await store.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
    },

    async clear() {
      await store.removeItem(SNAPSHOT_KEY);
    },
  };
}
