import { View } from 'react-native';

import { DiuText } from '@/core/components/text/Text';

export function SavedScreen() {
  return (
    <View className="bg-bg flex-1 items-center justify-center">
      <DiuText variant="pageTitle">Saved</DiuText>
      <DiuText variant="bodySm" className="mt-2">
        You are on the Saved screen
      </DiuText>
    </View>
  );
}
