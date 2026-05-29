import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  CardClass,
  FocusRequired,
  GeneralType,
  type TSessionPage,
} from '@diu/types';

import { sessionPageToStack } from '@/core/session/session-page';
import { useSessionFeed } from '@/core/session/useSessionFeed';

const mockSessionPage: TSessionPage = {
  sessionId: 'server-session-abc',
  cards: [
    {
      id: 'api-1',
      title: 'Server-authored card',
      description: 'From the session API',
      duration: 600,
      focusRequired: FocusRequired.MEDIUM,
      class: CardClass.GENERAL,
      classType: GeneralType.MEETING,
    },
  ],
  cursor: '1',
  hasMore: true,
};

describe('useSessionFeed', () => {
  test('loads initial session stack from SessionClient', async () => {
    const createSession = jest.fn().mockResolvedValue(mockSessionPage);

    const { result } = renderHook(() =>
      useSessionFeed({
        client: { createSession },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.sessionId).toBe('server-session-abc');
    });

    expect(result.current.stack).toEqual(sessionPageToStack(mockSessionPage));
    expect(createSession).toHaveBeenCalledTimes(1);
  });

  test('surfaces fetch error instead of loading forever', async () => {
    const createSession = jest
      .fn()
      .mockRejectedValue(new Error('Network request failed'));

    const { result } = renderHook(() =>
      useSessionFeed({
        client: { createSession },
        useFakeFeed: false,
      })
    );

    await waitFor(() => {
      expect(result.current.error).toBe('Network request failed');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.sessionId).toBeNull();
  });
});
