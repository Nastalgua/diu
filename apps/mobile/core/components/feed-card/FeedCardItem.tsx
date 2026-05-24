import { View } from 'react-native';
import { DiuText } from '@/core/components/text/Text';
import { TCard } from '#/types/card';
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
    <View
      className={`${backgroundColor} h-full w-full flex-col justify-end gap-4 px-6 pb-6`}
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
    </View>
  );
}
