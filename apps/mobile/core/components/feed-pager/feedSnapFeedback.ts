import * as Haptics from 'expo-haptics';

export function notifyFeedSwipeStart() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
