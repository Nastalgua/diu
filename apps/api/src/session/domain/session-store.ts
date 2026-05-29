export type SessionRecord = {
  sessionId: string;
  exhausted: boolean;
};

const sessions = new Map<string, SessionRecord>();

export function createSession(sessionId: string): SessionRecord {
  const record: SessionRecord = { sessionId, exhausted: false };
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
}
