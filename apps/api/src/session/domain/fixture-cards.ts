import {
  CardClass,
  FocusRequired,
  GeneralType,
  SoftwareEngineeringType,
  type TCard,
} from '@diu/types';

export const SESSION_PAGE_SIZE = 2;
export const SESSION_DAILY_MAX = 5;

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
