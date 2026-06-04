export class FeedScrollPosition {
  private index: number;
  private readonly seen = new Set<number>();

  constructor(
    private readonly sessionId: string,
    initialIndex = 0
  ) {
    this.index = initialIndex;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getIndex(): number {
    return this.index;
  }

  markSeen(index: number): void {
    this.seen.add(index);
  }

  isSeen(index: number): boolean {
    return this.seen.has(index);
  }

  canGoBack(): boolean {
    return this.index > 0 && this.seen.has(this.index - 1);
  }

  getMinimumIndex(): number {
    return this.canGoBack() ? 0 : this.index;
  }

  settleIndex(nextIndex: number): void {
    if (nextIndex > this.index) {
      this.markSeen(this.index);
    }

    this.index = nextIndex;
  }
}

export function restoreFeedScrollPosition(
  sessionId: string,
  resumeIndex: number
): FeedScrollPosition {
  const position = new FeedScrollPosition(sessionId, resumeIndex);

  for (let index = 0; index < resumeIndex; index++) {
    position.markSeen(index);
  }

  return position;
}
