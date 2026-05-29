import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Navbar } from '@/core/components/Navbar';

const tabs = [
  { key: 'index-1', name: 'index' },
  { key: 'saved-1', name: 'saved' },
  { key: 'goals-1', name: 'goals' },
  { key: 'profile-1', name: 'profile' },
] as const;

function renderNavbar(activeIndex: number) {
  const emit = jest.fn(() => ({ defaultPrevented: false }));
  const navigate = jest.fn();

  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 0, right: 0, bottom: 0, left: 0 },
      }}
    >
      <Navbar
        state={{
          index: activeIndex,
          routes: [...tabs],
          routeNames: tabs.map((tab) => tab.name),
          history: [],
          key: 'tab-state',
          stale: false,
          type: 'tab',
          preloadedRouteKeys: [],
        }}
        navigation={{ emit, navigate } as never}
        descriptors={{} as never}
        insets={{ top: 0, right: 0, bottom: 0, left: 0 }}
      />
    </SafeAreaProvider>
  );

  return { emit, navigate };
}

describe('Navbar', () => {
  test('emits tabPress without navigating when the active tab is pressed again', () => {
    const { emit, navigate } = renderNavbar(0);

    fireEvent.press(screen.getAllByRole('button')[0]);

    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'index-1' })
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  test('navigates when an inactive tab is pressed', () => {
    const { emit, navigate } = renderNavbar(0);

    fireEvent.press(screen.getAllByRole('button')[1]);

    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'saved-1' })
    );
    expect(navigate).toHaveBeenCalledWith('saved');
  });
});
