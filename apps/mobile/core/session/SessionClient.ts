import type { TPrimarySource, TSessionPage } from '@diu/types';

import { sessionRequestHeaders } from '@/core/session/session-request-headers';

export type SessionClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
  now?: () => number;
};

export class SessionClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private readonly now: () => number;

  constructor(options: SessionClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetchFn = options.fetch ?? fetch;
    this.now = options.now ?? (() => Date.now());
  }

  private headers(extra?: HeadersInit): HeadersInit {
    return { ...sessionRequestHeaders(this.now()), ...extra };
  }

  async createSession(): Promise<TSessionPage> {
    const response = await this.fetchFn(`${this.baseUrl}/session`, {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Session fetch failed: ${response.status}`);
    }

    return response.json() as Promise<TSessionPage>;
  }

  async fetchNextPage(
    sessionId: string,
    cursor: string
  ): Promise<TSessionPage> {
    const url = `${this.baseUrl}/session/${sessionId}/cards?cursor=${encodeURIComponent(cursor)}`;
    const response = await this.fetchFn(url, { headers: this.headers() });

    if (!response.ok) {
      throw new Error(`Session fetch failed: ${response.status}`);
    }

    return response.json() as Promise<TSessionPage>;
  }

  async recordTackle(primarySource: TPrimarySource): Promise<void> {
    const response = await this.fetchFn(`${this.baseUrl}/session/tackle`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ primarySource }),
    });

    if (!response.ok) {
      throw new Error(`Tackle failed: ${response.status}`);
    }
  }
}
