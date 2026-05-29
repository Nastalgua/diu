import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useFeedScrollPosition } from '@/core/components/feed-pager/useFeedScrollPosition';

describe('useFeedScrollPosition', () => {
  test('refresh resets minimumIndex after paging forward', async () => {
    const { result } = renderHook(() => useFeedScrollPosition());

    act(() => {
      result.current.onIndexChange(1);
    });
    act(() => {
      result.current.onIndexChange(2);
    });

    expect(result.current.minimumIndex).toBe(0);

    act(() => {
      void result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.minimumIndex).toBe(0);
      expect(result.current.initialIndex).toBe(0);
    });
  });
});
