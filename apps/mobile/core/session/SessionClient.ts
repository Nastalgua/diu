import type { TSessionPage } from '@diu/types';

export type SessionClientOptions = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export class SessionClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: SessionClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetchFn = options.fetch ?? fetch;
  }

  async createSession(): Promise<TSessionPage> {
    const response = await this.fetchFn(`${this.baseUrl}/session`);

    if (!response.ok) {
      throw new Error(`Session fetch failed: ${response.status}`);
    }

    return response.json() as Promise<TSessionPage>;
  }
}
