import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import { CardClass, FocusRequired, SoftwareEngineeringType } from '@diu/types';

import {
  cards,
  feedStack,
  longCopyCard,
} from '@/core/components/feed-card/fake-data';
import { FeedScreen } from '@/core/screens/FeedScreen';
import { useSessionFeed } from '@/core/session/useSessionFeed';

jest.mock('@/core/session/useSessionFeed');

const mockUseSessionFeed = useSessionFeed as jest.MockedFunction<
  typeof useSessionFeed
>;

function mockFakeSessionFeed() {
  mockUseSessionFeed.mockReturnValue({
    sessionId: 'fake-session',
    stack: feedStack,
    isLoading: false,
    error: null,
    refresh: jest.fn().mockResolvedValue('fake-session'),
    retry: jest.fn(),
  });
}

let mockTabPressHandler: (() => void) | undefined;
let mockIsFocused = true;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    addListener: (event: string, handler: () => void) => {
      if (event === 'tabPress') {
        mockTabPressHandler = handler;
      }

      return jest.fn();
    },
  }),
  useIsFocused: () => mockIsFocused,
}));

const PAGE_HEIGHT = 800;

function layoutFeedViewport() {
  fireEvent(screen.getByTestId('feed-viewport-content'), 'layout', {
    nativeEvent: { layout: { height: PAGE_HEIGHT, width: 375, x: 0, y: 0 } },
  });
}

function scrollFeedPagerTo(offsetY: number) {
  const pager = screen.getByTestId('feed-pager');
  const contentHeight = PAGE_HEIGHT * feedStack.length;

  fireEvent.scroll(pager, {
    nativeEvent: {
      contentOffset: { y: offsetY, x: 0 },
      contentSize: { height: contentHeight, width: 375 },
      layoutMeasurement: { height: PAGE_HEIGHT, width: 375 },
    },
  });

  fireEvent(pager, 'onMomentumScrollEnd', {
    nativeEvent: {
      contentOffset: { y: offsetY, x: 0 },
      contentSize: { height: contentHeight, width: 375 },
      layoutMeasurement: { height: PAGE_HEIGHT, width: 375 },
    },
  });
}

function advanceThroughWorkCards() {
  for (let i = 0; i < cards.length; i++) {
    const saveButton = within(screen.getByTestId('feed-pager')).getAllByRole(
      'button',
      { name: 'Save' }
    )[0];
    fireEvent.press(saveButton);
  }
}

describe('FeedScreen', () => {
  beforeEach(() => {
    mockTabPressHandler = undefined;
    mockIsFocused = true;
    mockFakeSessionFeed();
  });

  test('shows Save and Tackle on the current pager page', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    const pager = screen.getByTestId('feed-pager');
    const firstPage = within(pager).getAllByTestId('feed-page')[0];

    expect(
      within(firstPage).getByRole('button', { name: 'Save' })
    ).toBeOnTheScreen();
    expect(
      within(firstPage).getByRole('button', { name: 'Tackle' })
    ).toBeOnTheScreen();
    expect(
      within(firstPage).queryByRole('button', { name: /pass/i })
    ).toBeNull();
  });

  test('tapping Save advances to the next card', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    expect(screen.getByText(cards[0].title)).toBeOnTheScreen();

    const saveButton = within(screen.getByTestId('feed-pager')).getAllByRole(
      'button',
      { name: 'Save' }
    )[0];
    fireEvent.press(saveButton);

    expect(screen.getByText(cards[1].title)).toBeOnTheScreen();
  });

  test('tapping Tackle advances to the next card', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    expect(screen.getByText(cards[0].title)).toBeOnTheScreen();

    const tackleButton = within(screen.getByTestId('feed-pager')).getAllByRole(
      'button',
      { name: 'Tackle' }
    )[0];
    fireEvent.press(tackleButton);

    expect(screen.getByText(cards[1].title)).toBeOnTheScreen();
  });

  test('renders an action bar on each work card page', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    const pager = screen.getByTestId('feed-pager');
    const pages = within(pager).getAllByTestId('feed-page');
    const actionBars = within(pager).getAllByTestId('feed-action-bar');

    expect(pages.length).toBe(cards.length);
    expect(actionBars.length).toBe(cards.length);
    expect(within(pager).getByTestId('feed-end-page')).toBeOnTheScreen();
  });

  test('lands on the end card after paging forward through all work cards', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    advanceThroughWorkCards();

    expect(screen.getByText(/caught up/i)).toBeOnTheScreen();
    expect(screen.getByTestId('feed-end-page')).toBeOnTheScreen();
  });

  test('snaps to the end card when paging forward from the last work card', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    for (let i = 0; i < cards.length - 1; i++) {
      const saveButton = within(screen.getByTestId('feed-pager')).getAllByRole(
        'button',
        { name: 'Save' }
      )[0];
      fireEvent.press(saveButton);
    }

    expect(screen.getByText(cards[cards.length - 1].title)).toBeOnTheScreen();

    scrollFeedPagerTo(PAGE_HEIGHT * cards.length);

    expect(screen.getByText(/caught up/i)).toBeOnTheScreen();
  });

  test('swiping back from the end card returns to the last work card', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    advanceThroughWorkCards();
    expect(screen.getByText(/caught up/i)).toBeOnTheScreen();

    scrollFeedPagerTo(PAGE_HEIGHT * (cards.length - 1));

    expect(screen.getByText(cards[cards.length - 1].title)).toBeOnTheScreen();
  });

  test('end card page fills the pager viewport', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    advanceThroughWorkCards();

    const endPage = screen.getByTestId('feed-end-page');
    expect(endPage.props.className).toContain('h-full');
    expect(endPage.props.className).toContain('w-full');
  });

  test('keeps the action bar separate from card body content', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    const firstPage = within(screen.getByTestId('feed-pager')).getAllByTestId(
      'feed-page'
    )[0];

    expect(within(firstPage).getByTestId('feed-action-bar')).toBeOnTheScreen();
    expect(within(firstPage).getByText(cards[0].title)).toBeOnTheScreen();
  });

  test('re-tapping the Feed tab resets the pager to the first card', async () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    const saveButton = within(screen.getByTestId('feed-pager')).getAllByRole(
      'button',
      { name: 'Save' }
    )[0];
    fireEvent.press(saveButton);
    fireEvent.press(saveButton);

    expect(screen.getByText(cards[2].title)).toBeOnTheScreen();

    await act(async () => {
      mockTabPressHandler?.();
    });

    await waitFor(() => {
      expect(screen.getByText(cards[0].title)).toBeOnTheScreen();
    });
  });

  test('re-tapping the Feed tab shows loading feedback', async () => {
    let resolveRefresh!: (value: string) => void;
    const refresh = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRefresh = resolve;
        })
    );
    mockUseSessionFeed.mockReturnValue({
      sessionId: 'fake-session',
      stack: feedStack,
      isLoading: false,
      error: null,
      refresh,
      retry: jest.fn(),
    });

    render(<FeedScreen />);
    layoutFeedViewport();

    await act(async () => {
      mockTabPressHandler?.();
    });

    expect(screen.getByTestId('feed-refresh-loading')).toBeOnTheScreen();

    await act(async () => {
      resolveRefresh('fake-session-2');
    });

    await waitFor(() => {
      expect(screen.queryByTestId('feed-refresh-loading')).toBeNull();
    });
  });

  test('renders server-authored cards from the session API', () => {
    mockUseSessionFeed.mockReturnValue({
      sessionId: 'server-session-abc',
      stack: [
        {
          id: 'api-1',
          title: 'Review PR #142',
          description: 'Auth refactor — 3 files changed, 2 approvals needed',
          duration: 600,
          focusRequired: FocusRequired.LOW,
          class: CardClass.SOFTWARE_ENGINEERING,
          classType: SoftwareEngineeringType.PR_REVIEW_REQUEST,
        },
      ],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
      retry: jest.fn(),
    });

    render(<FeedScreen />);
    layoutFeedViewport();

    expect(screen.getByText('Review PR #142')).toBeOnTheScreen();
    expect(
      screen.getByText('Auth refactor — 3 files changed, 2 approvals needed')
    ).toBeOnTheScreen();
  });

  test('does not refresh when the Feed tab is pressed while another tab is active', async () => {
    mockIsFocused = false;
    render(<FeedScreen />);
    layoutFeedViewport();

    const saveButton = within(screen.getByTestId('feed-pager')).getAllByRole(
      'button',
      { name: 'Save' }
    )[0];
    fireEvent.press(saveButton);

    expect(screen.getByText(cards[1].title)).toBeOnTheScreen();

    mockTabPressHandler?.();

    expect(screen.getByText(cards[1].title)).toBeOnTheScreen();
    expect(screen.queryByTestId('feed-refresh-loading')).toBeNull();
  });

  test('shows retry UI when session fetch fails', () => {
    const retry = jest.fn();
    mockUseSessionFeed.mockReturnValue({
      sessionId: null,
      stack: [],
      isLoading: false,
      error: 'Network request failed',
      refresh: jest.fn(),
      retry,
    });

    render(<FeedScreen />);
    layoutFeedViewport();

    expect(screen.getByTestId('feed-session-error')).toBeOnTheScreen();
    expect(screen.getByText('Network request failed')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('feed-session-retry'));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  test('long copy card scrolls internally without breaking page snap', () => {
    render(<FeedScreen />);
    layoutFeedViewport();

    scrollFeedPagerTo(PAGE_HEIGHT);

    const pager = screen.getByTestId('feed-pager');
    const longCopyPage = within(pager)
      .getAllByTestId('feed-page')
      .find((page) => within(page).queryByText(longCopyCard.title));

    expect(longCopyPage).toBeTruthy();
    expect(
      within(longCopyPage!).getByTestId('feed-card-scroll')
    ).toBeOnTheScreen();

    scrollFeedPagerTo(PAGE_HEIGHT * 2);

    expect(screen.getByText(cards[2].title)).toBeOnTheScreen();
  });
});
