import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useFeedScrollPosition } from '@/core/components/feed-pager/useFeedScrollPosition';

describe('useFeedScrollPosition', () => {
  test('starts at the persisted resume index for the same session', () => {
    const { result } = renderHook(() => useFeedScrollPosition('session-a', 2));

    expect(result.current.initialIndex).toBe(2);
    expect(result.current.minimumIndex).toBe(0);
  });

  test('keeps pager initialIndex fixed while the user pages forward', () => {
    const { result } = renderHook(() => useFeedScrollPosition('session-a', 0));

    expect(result.current.initialIndex).toBe(0);

    act(() => {
      result.current.onIndexChange(1);
    });

    expect(result.current.initialIndex).toBe(0);
    expect(result.current.minimumIndex).toBe(0);
  });

  test('resets scroll position when the feed session id changes', async () => {
    const { result, rerender } = renderHook(
      ({ sessionId }: { sessionId: string }) =>
        useFeedScrollPosition(sessionId),
      { initialProps: { sessionId: 'session-a' } }
    );

    act(() => {
      result.current.onIndexChange(1);
    });
    act(() => {
      result.current.onIndexChange(2);
    });

    expect(result.current.minimumIndex).toBe(0);
    expect(result.current.initialIndex).toBe(0);

    rerender({ sessionId: 'session-b' });

    await waitFor(() => {
      expect(result.current.minimumIndex).toBe(0);
      expect(result.current.initialIndex).toBe(0);
    });
  });
});
