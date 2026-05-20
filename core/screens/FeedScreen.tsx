import { View } from 'react-native';

import { DiuText } from '../components/text/Text';

export function FeedScreen() {
  return (
    <View className="bg-bg flex-1 items-center justify-center">
      <DiuText variant="pageTitle">Feed</DiuText>
      <DiuText variant="bodySm" className="mt-2">
        You are on the Feed screen
      </DiuText>
    </View>
  );
}
