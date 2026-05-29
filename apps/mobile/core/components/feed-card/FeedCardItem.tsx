import { ScrollView, View } from 'react-native';
import { DiuText } from '@/core/components/text/Text';
import { TCard } from '@diu/types';
import EnergyPill from './EnergyPill';
import { getCardStyle } from './helper';

type FeedCardItemProps = {
  card: TCard;
};

export default function FeedCardItem({ card }: FeedCardItemProps) {
  const {
    backgroundColor,
    energyPillBgColor,
    energyPillTextColor,
    energyPillDotColor,
  } = getCardStyle(card);

  return (
    <View className={`${backgroundColor} h-full w-full flex-1`}>
      <ScrollView
        testID="feed-card-scroll"
        className="flex-1"
        contentContainerClassName="flex-grow justify-end gap-4 px-6 pt-6 pb-2"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <EnergyPill
          timeToCompletion={card.duration}
          focusRequired={card.focusRequired}
          energyPillBgColor={energyPillBgColor}
          energyPillTextColor={energyPillTextColor}
          energyPillDotColor={energyPillDotColor}
        />

        <View>
          <DiuText variant="cardTitle">{card.title}</DiuText>
          <DiuText variant="body">{card.description}</DiuText>
        </View>
      </ScrollView>
    </View>
  );
}
