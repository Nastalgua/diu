import { fixtureDecks } from './fixture-cards.js';

export type SessionRecord = {
  sessionId: string;
  deckIndex: number;
  exhausted: boolean;
};

const sessions = new Map<string, SessionRecord>();
let nextDeckIndex = 0;

export function createSession(sessionId: string): SessionRecord {
  const deckIndex = nextDeckIndex % fixtureDecks.length;
  nextDeckIndex += 1;
  const record: SessionRecord = { sessionId, deckIndex, exhausted: false };
  sessions.set(sessionId, record);
  return record;
}

export function getSession(sessionId: string): SessionRecord | undefined {
  return sessions.get(sessionId);
}

export function markSessionExhausted(sessionId: string): void {
  const record = sessions.get(sessionId);
  if (record) {
    record.exhausted = true;
  }
}

export function clearSessions(): void {
  sessions.clear();
  nextDeckIndex = 0;
}
