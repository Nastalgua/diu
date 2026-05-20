import { View } from 'react-native';

import { DiuText } from '../components/text/Text';

export function GoalsScreen() {
  return (
    <View className="bg-bg flex-1 items-center justify-center">
      <DiuText variant="pageTitle">Goals</DiuText>
      <DiuText variant="bodySm" className="mt-2">
        You are on the Goals screen
      </DiuText>
    </View>
  );
}
