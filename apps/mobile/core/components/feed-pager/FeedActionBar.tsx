import { IconArrowRight, IconBookmark } from '@tabler/icons-react-native';
import { Pressable, View } from 'react-native';

import { DiuText } from '@/core/components/text/Text';

const SAVE_ICON_COLOR = '#9A6A55';
const SAVE_ACTIVE_ICON_COLOR = '#D85A30';
const TACKLE_ICON_COLOR = '#FFFFFF';

type FeedActionBarProps = {
  pageBackgroundClassName: string;
  isSaved: boolean;
  isTackling: boolean;
  onSaveToggle: () => void;
  onTackleToggle: () => void;
};

type ToggleActionButtonProps = {
  accessibilityLabel: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
  variant: 'secondary' | 'primary';
  Icon: typeof IconBookmark;
};

function ToggleActionButton({
  accessibilityLabel,
  label,
  isActive,
  onPress,
  variant,
  Icon,
}: ToggleActionButtonProps) {
  const isPrimary = variant === 'primary';

  const containerClassName = isPrimary
    ? 'bg-accent'
    : isActive
      ? 'bg-accent/15'
      : 'bg-border';

  const textClassName = isPrimary
    ? 'text-white'
    : isActive
      ? 'text-accent'
      : 'text-muted';

  const iconColor = isPrimary
    ? TACKLE_ICON_COLOR
    : isActive
      ? SAVE_ACTIVE_ICON_COLOR
      : SAVE_ICON_COLOR;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isActive }}
      className={`flex-1 flex-row items-center justify-center gap-2 rounded-[20px] py-3.5 ${containerClassName}`}
      onPress={onPress}
    >
      <Icon
        size={18}
        strokeWidth={isActive ? 2.5 : 2}
        color={iconColor}
        fill={isActive && !isPrimary ? iconColor : 'transparent'}
      />
      <DiuText variant="body" className={`font-medium ${textClassName}`}>
        {label}
      </DiuText>
    </Pressable>
  );
}

export function FeedActionBar({
  pageBackgroundClassName,
  isSaved,
  isTackling,
  onSaveToggle,
  onTackleToggle,
}: FeedActionBarProps) {
  return (
    <View
      testID="feed-action-bar"
      className={`${pageBackgroundClassName} flex-row gap-3 px-6 pb-5 pt-4`}
    >
      <ToggleActionButton
        accessibilityLabel={isSaved ? 'Saved' : 'Save'}
        label={isSaved ? 'Saved' : 'Save'}
        isActive={isSaved}
        variant="secondary"
        Icon={IconBookmark}
        onPress={onSaveToggle}
      />
      <ToggleActionButton
        accessibilityLabel={isTackling ? 'Tackling' : 'Tackle'}
        label={isTackling ? 'Tackling' : 'Tackle'}
        isActive={isTackling}
        variant="primary"
        Icon={IconArrowRight}
        onPress={onTackleToggle}
      />
    </View>
  );
}
