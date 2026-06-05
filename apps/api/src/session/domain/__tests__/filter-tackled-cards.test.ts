import { describe, expect, it } from 'vitest';
import {
  CardClass,
  FocusRequired,
  SoftwareEngineeringType,
  type TCard,
} from '@diu/types';

import { omitTackledPrimarySources } from '../filter-tackled-cards.js';

const pr142 = { integration: 'github', sourceId: 'pr-142' };
const standup = { integration: 'google-calendar', sourceId: 'standup-9am' };

function card(id: string, primarySource: TCard['primarySource']): TCard {
  return {
    id,
    title: `Card ${id}`,
    description: 'Fixture',
    duration: 600,
    focusRequired: FocusRequired.LOW,
    class: CardClass.SOFTWARE_ENGINEERING,
    classType: SoftwareEngineeringType.PR_REVIEW_REQUEST,
    primarySource,
    contextSources: [],
  };
}

describe('omitTackledPrimarySources', () => {
  it('removes cards whose primary source was tackled today', () => {
    const deck = [card('1', pr142), card('2', standup), card('3', pr142)];

    expect(omitTackledPrimarySources(deck, [pr142])).toEqual([card('2', standup)]);
  });

  it('matches on integration and sourceId, not card id', () => {
    const deck = [
      card('a', pr142),
      card('b', { integration: 'github', sourceId: 'pr-143' }),
    ];

    expect(omitTackledPrimarySources(deck, [pr142])).toEqual([
      card('b', { integration: 'github', sourceId: 'pr-143' }),
    ]);
  });
});
