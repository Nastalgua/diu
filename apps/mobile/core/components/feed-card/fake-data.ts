import {
  TCard,
  FocusRequired,
  CardClass,
  GeneralType,
  SoftwareEngineeringType,
} from '@diu/types';

export type TEndCard = {
  kind: 'end';
  id: string;
  title: string;
  description: string;
};

export type TFeedStackItem = TCard | TEndCard;

export function isEndCard(item: TFeedStackItem): item is TEndCard {
  return 'kind' in item && item.kind === 'end';
}

export const longCopyCard: TCard = {
  id: 'long-copy',
  title: 'Write the quarterly engineering update',
  description: 'Summarize every initiative, risk, and dependency. '.repeat(50),
  duration: 45,
  focusRequired: FocusRequired.HIGH,
  class: CardClass.GENERAL,
  classType: GeneralType.MEETING,
  primarySource: { integration: 'notion', sourceId: 'quarterly-update' },
};

export const cards: TCard[] = [
  {
    id: '1',
    title: 'Review PR #142',
    description: 'Auth refactor — 3 files changed, 2 approvals needed',
    duration: 10,
    focusRequired: FocusRequired.LOW,
    class: CardClass.SOFTWARE_ENGINEERING,
    classType: SoftwareEngineeringType.ISSUE,
    primarySource: { integration: 'github', sourceId: 'pr-142' },
  },
  longCopyCard,
  {
    id: '2',
    title: 'Review PR #143',
    description: 'Auth refactor — 6 files changed, 1 approvals needed',
    duration: 15,
    focusRequired: FocusRequired.MEDIUM,
    class: CardClass.SOFTWARE_ENGINEERING,
    classType: SoftwareEngineeringType.PR_REVIEW_REQUEST,
    primarySource: { integration: 'github', sourceId: 'pr-143' },
  },
  {
    id: '3',
    title: 'Review PR #144',
    description: 'Auth refactor — 8 files changed, 3 approvals needed',
    duration: 20,
    focusRequired: FocusRequired.HIGH,
    class: CardClass.SOFTWARE_ENGINEERING,
    classType: SoftwareEngineeringType.PR_READY_TO_MERGE,
    primarySource: { integration: 'github', sourceId: 'pr-144' },
  },
  {
    id: '4',
    title: 'Meeting with John Doe',
    description: 'Discuss the new feature',
    duration: 30,
    focusRequired: FocusRequired.HIGH,
    class: CardClass.GENERAL,
    classType: GeneralType.MEETING,
    primarySource: { integration: 'google-calendar', sourceId: '1on1-john' },
  },
  {
    id: '5',
    title: 'Reply to email',
    description: 'Reply to email from John Doe',
    duration: 5,
    focusRequired: FocusRequired.LOW,
    class: CardClass.GENERAL,
    classType: GeneralType.NEEDS_REPLY,
    primarySource: { integration: 'gmail', sourceId: 'thread-john-doe' },
  },
];

const endCard: TEndCard = {
  kind: 'end',
  id: 'end',
  title: 'Caught up',
  description: "You're through today's stack.",
};

export const feedStack: TFeedStackItem[] = [...cards, endCard];

export async function loadFeedCards(): Promise<TFeedStackItem[]> {
  return feedStack;
}
