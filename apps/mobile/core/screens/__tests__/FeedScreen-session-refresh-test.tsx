import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
import {
  CardClass,
  FocusRequired,
  GeneralType,
  type TSessionPage,
} from '@diu/types';

import { FeedScreen } from '@/core/screens/FeedScreen';
import type {
  SessionFeedClient,
  UseSessionFeedOptions,
} from '@/core/session/useSessionFeed';

const PAGE_HEIGHT = 800;

const card = (id: string, title: string) => ({
  id,
  title,
  description: `Description for ${title}`,
  duration: 600,
  focusRequired: FocusRequired.MEDIUM,
  class: CardClass.GENERAL,
  classType: GeneralType.MEETING,
});

const initialPage: TSessionPage = {
  sessionId: 'server-session-abc',
  cards: [card('api-1', 'First card'), card('api-2', 'Second card')],
  cursor: '2',
  hasMore: true,
};

const refreshedPage: TSessionPage = {
  sessionId: 'server-session-xyz',
  cards: [card('api-9', 'Fresh first card'), card('api-10', 'Fresh second card')],
  cursor: '2',
  hasMore: true,
};

const mockSessionClient: SessionFeedClient = {
  createSession: jest.fn(),
  fetchNextPage: jest.fn(),
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

    const saveButton = within(screen.getByTestId('feed-pager')).getAllByRole(
      'button',
      { name: 'Save' }
    )[0];
    fireEvent.press(saveButton);

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
