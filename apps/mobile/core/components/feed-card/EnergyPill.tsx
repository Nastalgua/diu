import { View } from 'react-native';
import { DiuText } from '../text/Text';
import { useMemo } from 'react';
import { FocusRequired } from '#/types/card';

interface EnergyPillProps {
  timeToCompletion: number; // in seconds
  focusRequired: FocusRequired;
  energyPillBgColor: string;
  energyPillTextColor: string;
  energyPillDotColor: string;
}

export default function EnergyPill({
  timeToCompletion,
  focusRequired,
  energyPillBgColor,
  energyPillTextColor,
  energyPillDotColor,
}: EnergyPillProps) {
  const timeToCompletionInHighestOrder = useMemo(() => {
    if (timeToCompletion < 60) {
      return `${timeToCompletion} SECS`;
    } else if (timeToCompletion < 3600) {
      // less than 1 hour
      return `${Math.ceil(timeToCompletion / 60)} MINS`;
    } else if (timeToCompletion < 86400) {
      // less than 1 day
      return `${Math.ceil(timeToCompletion / 3600)} HOURS`;
    } else {
      return `${Math.ceil(timeToCompletion / 86400)} DAYS`;
    }
  }, [timeToCompletion]);

  return (
    <View
      className={`rounded-pill flex flex-row items-center px-4 py-2 ${energyPillBgColor}`}
    >
      <View className={`${energyPillDotColor} mr-2 h-2 w-2 rounded-full`} />
      <DiuText variant="energyPill" className={`${energyPillTextColor} mr-2`}>
        {focusRequired.toUpperCase() + ' FOCUS'}
      </DiuText>
      <View className={`${energyPillDotColor} mr-2 h-1 w-1 rounded-full`} />
      <DiuText variant="energyPill" className={`${energyPillTextColor}`}>
        {timeToCompletionInHighestOrder}
      </DiuText>
    </View>
  );
}
