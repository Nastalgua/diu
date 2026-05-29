import { Text, View } from 'react-native';

import type { TEndCard } from '@/core/components/feed-card/fake-data';

type FeedEndPageProps = {
  endCard: TEndCard;
};

export function FeedEndPage({ endCard }: FeedEndPageProps) {
  return (
    <View testID="feed-end-page" className="h-full w-full flex-col justify-center px-6">
      <Text className="font-heading text-3xl text-ink">{endCard.title}</Text>
      <Text className="mt-2 font-body text-lg text-ink-muted">
        {endCard.description}
      </Text>
    </View>
  );
}
