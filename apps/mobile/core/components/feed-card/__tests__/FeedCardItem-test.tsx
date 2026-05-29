import { render, screen } from '@testing-library/react-native';
import {
  CardClass,
  FocusRequired,
  GeneralType,
  type TCard,
} from '@diu/types';

import FeedCardItem from '@/core/components/feed-card/FeedCardItem';

const longCopyCard: TCard = {
  id: 'long-copy',
  title: 'Write the quarterly engineering update',
  description: 'Summarize every initiative, risk, and dependency. '.repeat(20),
  duration: 45,
  focusRequired: FocusRequired.HIGH,
  class: CardClass.GENERAL,
  classType: GeneralType.MEETING,
};

describe('FeedCardItem', () => {
  test('scrolls long card copy inside the card body', () => {
    render(<FeedCardItem card={longCopyCard} />);

    expect(screen.getByTestId('feed-card-scroll')).toBeOnTheScreen();
    expect(screen.getByText(longCopyCard.title)).toBeOnTheScreen();
    expect(screen.getByText(longCopyCard.description)).toBeOnTheScreen();
  });
});
