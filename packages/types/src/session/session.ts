import type { TCard } from '../card/card';
import type { TEndCard } from '../card/end-card';

export type TSessionPage = {
  sessionId: string;
  cards: TCard[];
  cursor: string | null;
  hasMore: boolean;
  endCard?: TEndCard;
};
