import { View } from 'react-native';
import type { TCard } from '@diu/types';

import FeedCardItem from '@/core/components/feed-card/FeedCardItem';
import { getCardStyle } from '@/core/components/feed-card/helper';
import { FeedActionBar } from '@/core/components/feed-pager/FeedActionBar';

type FeedPageProps = {
  card: TCard;
  onSave: () => void;
  onTackle: () => void;
};

export function FeedPage({ card, onSave, onTackle }: FeedPageProps) {
  const { backgroundColor } = getCardStyle(card);

  return (
    <View
      testID="feed-page"
      className={`${backgroundColor} h-full w-full flex-col`}
    >
      <View className="min-h-0 flex-1">
        <FeedCardItem card={card} />
      </View>
      <FeedActionBar
        pageBackgroundClassName={backgroundColor}
        onSave={onSave}
        onTackle={onTackle}
      />
    </View>
  );
}
