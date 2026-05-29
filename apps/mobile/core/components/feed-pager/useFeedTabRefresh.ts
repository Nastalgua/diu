import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';
import { useEffect } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';

export function useFeedTabRefresh(refresh: () => void | Promise<void>) {
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const isFocused = useIsFocused();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (isFocused) {
        void refresh();
      }
    });

    return unsubscribe;
  }, [navigation, isFocused, refresh]);
}
