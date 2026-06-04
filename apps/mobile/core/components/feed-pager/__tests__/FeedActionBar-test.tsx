import { fireEvent, render, screen } from '@testing-library/react-native';

import { FeedActionBar } from '@/core/components/feed-pager/FeedActionBar';

describe('FeedActionBar', () => {
  test('shows Save and Tackle actions only', () => {
    render(
      <FeedActionBar
        pageBackgroundClassName="bg-card-issue"
        isSaved={false}
        isTackling={false}
        onSaveToggle={jest.fn()}
        onTackleToggle={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tackle' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /pass/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /skip/i })).toBeNull();
  });

  test('shows active labels when saved or tackling', () => {
    render(
      <FeedActionBar
        pageBackgroundClassName="bg-card-issue"
        isSaved
        isTackling
        onSaveToggle={jest.fn()}
        onTackleToggle={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Saved' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tackling' })).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Saved' }).props.accessibilityState
    ).toEqual(expect.objectContaining({ selected: true }));
    expect(
      screen.getByRole('button', { name: 'Tackling' }).props.accessibilityState
    ).toEqual(expect.objectContaining({ selected: true }));
  });

  test('calls toggle handlers when pressed', () => {
    const onSaveToggle = jest.fn();
    const onTackleToggle = jest.fn();

    render(
      <FeedActionBar
        pageBackgroundClassName="bg-card-issue"
        isSaved={false}
        isTackling={false}
        onSaveToggle={onSaveToggle}
        onTackleToggle={onTackleToggle}
      />
    );

    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    fireEvent.press(screen.getByRole('button', { name: 'Tackle' }));

    expect(onSaveToggle).toHaveBeenCalledTimes(1);
    expect(onTackleToggle).toHaveBeenCalledTimes(1);
  });
});
