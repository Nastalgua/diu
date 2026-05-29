import {
  CardClass,
  FocusRequired,
  GeneralType,
  SoftwareEngineeringType,
  type TCard,
} from '@diu/types';

export const SESSION_PAGE_SIZE = 2;
export const SESSION_DAILY_MAX = 5;

/** Primary deck — stable ids for API contract tests. */
export const fixtureCards: TCard[] = [
  {
    id: '1',
    title: 'Review PR #142',
    description: 'Auth refactor — 3 files changed, 2 approvals needed',
    duration: 600,
    focusRequired: FocusRequired.LOW,
    class: CardClass.SOFTWARE_ENGINEERING,
    classType: SoftwareEngineeringType.PR_REVIEW_REQUEST,
  },
  {
    id: '2',
    title: 'Prep for standup',
    description: 'Starts in 20 min — review open PRs before the sync',
    duration: 900,
    focusRequired: FocusRequired.MEDIUM,
    class: CardClass.GENERAL,
    classType: GeneralType.MEETING,
  },
  {
    id: '3',
    title: 'Reply to email',
    description: 'Reply to email from John Doe',
    duration: 300,
    focusRequired: FocusRequired.LOW,
    class: CardClass.GENERAL,
    classType: GeneralType.NEEDS_REPLY,
  },
  {
    id: '4',
    title: 'Review PR #143',
    description: 'Auth refactor — 6 files changed, 1 approvals needed',
    duration: 900,
    focusRequired: FocusRequired.MEDIUM,
    class: CardClass.SOFTWARE_ENGINEERING,
    classType: SoftwareEngineeringType.PR_REVIEW_REQUEST,
  },
  {
    id: '5',
    title: 'Meeting with John Doe',
    description: 'Discuss the new feature',
    duration: 1800,
    focusRequired: FocusRequired.HIGH,
    class: CardClass.GENERAL,
    classType: GeneralType.MEETING,
  },
];

export const fixtureEndCard = {
  kind: 'end' as const,
  id: 'end',
  title: 'Caught up',
  description: "You're through today's stack.",
};

/** Alternate deck so a new session is obvious when re-tapping Feed in dev. */
const fixtureCardsDeckB: TCard[] = [
  {
    id: 'b-1',
    title: 'Draft Q2 roadmap',
    description: 'Outline themes and risks before the planning sync',
    duration: 1200,
    focusRequired: FocusRequired.HIGH,
    class: CardClass.GENERAL,
    classType: GeneralType.MEETING,
  },
  {
    id: 'b-2',
    title: 'Fix flaky CI on main',
    description: 'Auth e2e times out ~30% — reproduce and stabilize',
    duration: 1800,
    focusRequired: FocusRequired.MEDIUM,
    class: CardClass.SOFTWARE_ENGINEERING,
    classType: SoftwareEngineeringType.PR_REVIEW_REQUEST,
  },
  {
    id: 'b-3',
    title: 'Reply to design feedback',
    description: 'Mobile nav mock — 4 comments on spacing and hierarchy',
    duration: 600,
    focusRequired: FocusRequired.LOW,
    class: CardClass.GENERAL,
    classType: GeneralType.NEEDS_REPLY,
  },
  {
    id: 'b-4',
    title: 'Schedule 1:1 with Alex',
    description: 'Career growth check-in — pick two topics beforehand',
    duration: 300,
    focusRequired: FocusRequired.LOW,
    class: CardClass.GENERAL,
    classType: GeneralType.MEETING,
  },
  {
    id: 'b-5',
    title: 'Triage inbox zero',
    description: 'Clear 12 starred threads before end of day',
    duration: 900,
    focusRequired: FocusRequired.MEDIUM,
    class: CardClass.GENERAL,
    classType: GeneralType.NEEDS_REPLY,
  },
];

const fixtureEndCardDeckB = {
  kind: 'end' as const,
  id: 'end-b',
  title: 'Caught up',
  description: "You're through this session's stack.",
};

export const fixtureDecks = [
  { cards: fixtureCards, endCard: fixtureEndCard },
  { cards: fixtureCardsDeckB, endCard: fixtureEndCardDeckB },
] as const;

export function getFixtureDeck(deckIndex: number) {
  return fixtureDecks[deckIndex % fixtureDecks.length]!;
}
