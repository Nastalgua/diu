import { IconArrowRight, IconBookmark } from '@tabler/icons-react-native';
import { Pressable, View } from 'react-native';

import { DiuText } from '@/core/components/text/Text';

const SAVE_ICON_COLOR = '#9A6A55';
const TACKLE_ICON_COLOR = '#FFFFFF';

type FeedActionBarProps = {
  pageBackgroundClassName: string;
  onSave: () => void;
  onTackle: () => void;
};

type ActionButtonProps = {
  accessibilityLabel: string;
  label: string;
  onPress: () => void;
  variant: 'secondary' | 'primary';
  Icon: typeof IconBookmark;
};

function ActionButton({
  accessibilityLabel,
  label,
  onPress,
  variant,
  Icon,
}: ActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`flex-1 flex-row items-center justify-center gap-2 rounded-[20px] py-3.5 ${
        isPrimary ? 'bg-accent' : 'bg-border'
      }`}
      onPress={onPress}
    >
      <Icon
        size={18}
        strokeWidth={2}
        color={isPrimary ? TACKLE_ICON_COLOR : SAVE_ICON_COLOR}
      />
      <DiuText
        variant="body"
        className={`font-medium ${isPrimary ? 'text-white' : 'text-muted'}`}
      >
        {label}
      </DiuText>
    </Pressable>
  );
}

export function FeedActionBar({
  pageBackgroundClassName,
  onSave,
  onTackle,
}: FeedActionBarProps) {
  return (
    <View
      testID="feed-action-bar"
      className={`${pageBackgroundClassName} flex-row gap-3 px-6 pb-5 pt-4`}
    >
      <ActionButton
        accessibilityLabel="Save"
        label="Save"
        variant="secondary"
        Icon={IconBookmark}
        onPress={onSave}
      />
      <ActionButton
        accessibilityLabel="Tackle"
        label="Tackle"
        variant="primary"
        Icon={IconArrowRight}
        onPress={onTackle}
      />
    </View>
  );
}
