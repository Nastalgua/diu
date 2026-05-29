import {
  CardClass,
  FocusRequired,
  GeneralType,
  SoftwareEngineeringType,
  type TCard,
} from '@diu/types';
import { Hono } from 'hono';

export type ApiEnv = {
  Variables: Record<string, never>;
};

export const app = new Hono<ApiEnv>();

app.get('/', (c) =>
  c.json({
    name: 'diu-api',
    version: '0.0.0',
  }),
);

app.get('/health', (c) => c.json({ ok: true }));

app.get('/session/cards', (c) => {
  const cards: TCard[] = [
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
  ];

  return c.json({ cards });
});
