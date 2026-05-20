import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  IconBookmark,
  IconLayoutCards,
  IconTarget,
  IconUserCircle,
} from '@tabler/icons-react-native';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DOT_SIZE = 4;

const tabs = [
  { route: 'index', Icon: IconLayoutCards },
  { route: 'saved', Icon: IconBookmark },
  { route: 'goals', Icon: IconTarget },
  { route: 'profile', Icon: IconUserCircle },
] as const;

const springConfig = {
  damping: 20,
  stiffness: 220,
  mass: 0.6,
};

export function Navbar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const dotX = useSharedValue(0);

  const activeTabIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.route === state.routes[state.index]?.name)
  );

  const tabWidth = barWidth / tabs.length;

  useEffect(() => {
    if (tabWidth <= 0) return;

    dotX.value = withSpring(
      activeTabIndex * tabWidth + (tabWidth - DOT_SIZE) / 2,
      springConfig
    );
  }, [activeTabIndex, tabWidth, dotX]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dotX.value }],
  }));

  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      className="border-t border-border bg-surface px-7 pt-3"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      <View onLayout={onBarLayout}>
        <View className="flex-row">
          {tabs.map(({ route, Icon }) => {
            const routeIndex = state.routes.findIndex(
              (item) => item.name === route
            );
            const isFocused = routeIndex === state.index;

            return (
              <Pressable
                key={route}
                accessibilityRole="button"
                onPress={() => {
                  if (routeIndex >= 0)
                    navigation.navigate(state.routes[routeIndex].name);
                }}
                className="flex-1 items-center"
              >
                <Icon
                  size={28}
                  strokeWidth={1.8}
                  color={isFocused ? '#D85A30' : '#C4A090'}
                />
              </Pressable>
            );
          })}
        </View>

        <View className="relative mt-2 h-1">
          <Animated.View
            className="bg-accent absolute h-1 w-1 rounded-full"
            style={dotStyle}
          />
        </View>
      </View>
    </View>
  );
}
