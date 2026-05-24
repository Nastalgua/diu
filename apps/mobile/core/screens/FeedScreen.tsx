import { View } from 'react-native';

import FeedCardItem from '@/core/components/feed-card/FeedCardItem';
import { cards } from '@/core/components/feed-card/fake-data';

export function FeedScreen() {
  return (
    <View className="bg-bg flex-1">
      {cards.map((card) => (
        <FeedCardItem key={card.id} card={card} />
      ))}
    </View>
  );
}
