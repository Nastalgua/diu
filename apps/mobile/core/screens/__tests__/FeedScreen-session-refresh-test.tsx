import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { TSessionPage } from '@diu/types';

import { FeedScreen } from '@/core/screens/FeedScreen';
import { testCard } from '@/core/session/test-card';
import type {
  SessionFeedClient,
  UseSessionFeedOptions,
} from '@/core/session/useSessionFeed';

const PAGE_HEIGHT = 800;

const initialPage: TSessionPage = {
  sessionId: 'server-session-abc',
  cards: [testCard('api-1', 'First card'), testCard('api-2', 'Second card')],
  cursor: '2',
  hasMore: true,
};

const refreshedPage: TSessionPage = {
  sessionId: 'server-session-xyz',
  cards: [
    testCard('api-9', 'Fresh first card'),
    testCard('api-10', 'Fresh second card'),
  ],
  cursor: '2',
  hasMore: true,
};

const mockSessionClient: SessionFeedClient = {
  createSession: jest.fn(),
  fetchNextPage: jest.fn(),
  recordTackle: jest.fn(),
};

jest.mock('@/core/session/useSessionFeed', () => {
  const actual = jest.requireActual<typeof import('@/core/session/useSessionFeed')>(
    '@/core/session/useSessionFeed'
  );

  return {
    ...actual,
    useSessionFeed: (options: UseSessionFeedOptions = {}) =>
      actual.useSessionFeed({
        ...options,
        client: options.client ?? mockSessionClient,
        useFakeFeed: options.useFakeFeed ?? false,
      }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    addListener: (event: string, handler: () => void) => {
      if (event === 'tabPress') {
        mockTabPressHandler = handler;
      }

      return jest.fn();
    },
  }),
  useIsFocused: () => true,
}));

let mockTabPressHandler: (() => void) | undefined;

function layoutFeedViewport() {
  fireEvent(screen.getByTestId('feed-viewport-content'), 'layout', {
    nativeEvent: { layout: { height: PAGE_HEIGHT, width: 375, x: 0, y: 0 } },
  });
}

function scrollFeedPagerTo(offsetY: number, pageCount: number) {
  const pager = screen.getByTestId('feed-pager');
  const contentHeight = PAGE_HEIGHT * pageCount;

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

describe('FeedScreen session refresh', () => {
  let resolveRefresh!: (page: TSessionPage) => void;

  beforeEach(() => {
    mockTabPressHandler = undefined;
    (mockSessionClient.createSession as jest.Mock).mockReset();
    (mockSessionClient.fetchNextPage as jest.Mock).mockReset();
    (mockSessionClient.fetchNextPage as jest.Mock).mockResolvedValue({
      sessionId: 'server-session-abc',
      cards: [],
      cursor: null,
      hasMore: false,
    });
    (mockSessionClient.createSession as jest.Mock)
      .mockResolvedValueOnce(initialPage)
      .mockImplementationOnce(
        () =>
          new Promise<TSessionPage>((resolve) => {
            resolveRefresh = resolve;
          })
      );
  });

  test('re-tapping Feed fetches a new session, shows overlay, and resets to the first card', async () => {
    render(<FeedScreen />);

    await waitFor(() => {
      expect(mockSessionClient.createSession).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      layoutFeedViewport();
    });

    await waitFor(() => {
      expect(screen.getByText('First card')).toBeOnTheScreen();
    });

    scrollFeedPagerTo(PAGE_HEIGHT, initialPage.cards.length);

    expect(screen.getByText('Second card')).toBeOnTheScreen();
    expect(screen.queryByTestId('feed-session-loading')).toBeNull();

    await act(async () => {
      mockTabPressHandler?.();
    });

    expect(screen.getByTestId('feed-refresh-loading')).toBeOnTheScreen();
    expect(screen.queryByTestId('feed-session-loading')).toBeNull();
    expect(screen.getByText('Second card')).toBeOnTheScreen();
    expect(mockSessionClient.createSession).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveRefresh(refreshedPage);
    });

    await act(async () => {
      layoutFeedViewport();
    });

    await waitFor(() => {
      expect(screen.getByText('Fresh first card')).toBeOnTheScreen();
    });

    expect(screen.queryByTestId('feed-refresh-loading')).toBeNull();
    expect(screen.queryByText('First card')).toBeNull();
    expect(screen.queryByText('Second card')).toBeNull();
    expect(mockSessionClient.createSession).toHaveBeenCalledTimes(2);
  });
});
