import { render, screen } from '@testing-library/react-native';
import { CardClass, FocusRequired, GeneralType, type TCard } from '@diu/types';

import FeedCardItem from '@/core/components/feed-card/FeedCardItem';

const longCopyCard: TCard = {
  id: 'long-copy',
  title: 'Write the quarterly engineering update',
  description: 'Summarize every initiative, risk, and dependency. '.repeat(20),
  duration: 45,
  focusRequired: FocusRequired.HIGH,
  class: CardClass.GENERAL,
  classType: GeneralType.MEETING,
  primarySource: { integration: 'notion', sourceId: 'quarterly-update' },
  contextSources: [],
};

describe('FeedCardItem', () => {
  test('handles missing contextSources without crashing', () => {
    const legacyCard = {
      ...longCopyCard,
      contextSources: undefined,
    } as unknown as TCard;

    render(<FeedCardItem card={legacyCard} />);

    expect(screen.getByText(longCopyCard.title)).toBeOnTheScreen();
    expect(screen.queryByTestId('feed-card-context-sources')).toBeNull();
  });

  test('does not render context sources container when there are no context sources', () => {
    render(<FeedCardItem card={longCopyCard} />);

    expect(screen.queryByTestId('feed-card-context-sources')).toBeNull();
  });

  test('renders one context source note with integration identity', () => {
    const cardWithOneContextSource: TCard = {
      ...longCopyCard,
      contextSources: [
        {
          integration: 'google-calendar',
          sourceId: 'standup-123',
          contextNote: 'Standup starts in 20 minutes',
        },
      ],
    };

    render(<FeedCardItem card={cardWithOneContextSource} />);

    expect(screen.getByText('Standup starts in 20 minutes')).toBeOnTheScreen();
    expect(screen.getByText('Google calendar')).toBeOnTheScreen();
    expect(
      screen.getAllByTestId('context-source-icon-google-calendar-standup-123')
        .length
    ).toBeGreaterThan(0);
  });

  test('renders unknown integration without an icon', () => {
    const cardWithUnknownIntegration: TCard = {
      ...longCopyCard,
      contextSources: [
        {
          integration: 'custom-tool',
          sourceId: 'ctx-1',
          contextNote: 'Context from an unsupported source',
        },
      ],
    };

    render(<FeedCardItem card={cardWithUnknownIntegration} />);

    expect(screen.getByText('Custom tool')).toBeOnTheScreen();
    expect(
      screen.queryByTestId('context-source-icon-custom-tool-ctx-1')
    ).toBeNull();
  });

  test('renders up to three context source rows', () => {
    const cardWithThreeContextSources: TCard = {
      ...longCopyCard,
      contextSources: [
        {
          integration: 'google-calendar',
          sourceId: 'standup-123',
          contextNote: 'Standup starts in 20 minutes',
        },
        {
          integration: 'github',
          sourceId: 'pr-144',
          contextNote: 'This PR is on today agenda',
        },
        {
          integration: 'slack',
          sourceId: 'thread-11',
          contextNote: 'Team flagged a blocker here',
        },
      ],
    };

    render(<FeedCardItem card={cardWithThreeContextSources} />);

    expect(screen.getByText('Standup starts in 20 minutes')).toBeOnTheScreen();
    expect(screen.getByText('This PR is on today agenda')).toBeOnTheScreen();
    expect(screen.getByText('Team flagged a blocker here')).toBeOnTheScreen();
    expect(screen.queryByText(/\+\d+ more/)).toBeNull();
  });

  test('shows overflow count when there are more than three context sources', () => {
    const cardWithOverflowContextSources: TCard = {
      ...longCopyCard,
      contextSources: [
        {
          integration: 'google-calendar',
          sourceId: 'standup-123',
          contextNote: 'Standup starts in 20 minutes',
        },
        {
          integration: 'github',
          sourceId: 'pr-144',
          contextNote: 'This PR is on today agenda',
        },
        {
          integration: 'slack',
          sourceId: 'thread-11',
          contextNote: 'Team flagged a blocker here',
        },
        {
          integration: 'notion',
          sourceId: 'doc-1',
          contextNote: 'Background document for review',
        },
        {
          integration: 'jira',
          sourceId: 'issue-99',
          contextNote: 'Linked incident timeline',
        },
      ],
    };

    render(<FeedCardItem card={cardWithOverflowContextSources} />);

    expect(screen.getByText('Standup starts in 20 minutes')).toBeOnTheScreen();
    expect(screen.getByText('This PR is on today agenda')).toBeOnTheScreen();
    expect(screen.getByText('Team flagged a blocker here')).toBeOnTheScreen();
    expect(
      screen.queryByText('Background document for review')
    ).not.toBeOnTheScreen();
    expect(screen.getByText('+2 more')).toBeOnTheScreen();
  });

  test('scrolls long card copy inside the card body', () => {
    render(<FeedCardItem card={longCopyCard} />);

    expect(screen.getByTestId('feed-card-scroll')).toBeOnTheScreen();
    expect(screen.getByText(longCopyCard.title)).toBeOnTheScreen();
    expect(screen.getByText(longCopyCard.description)).toBeOnTheScreen();
  });
});
