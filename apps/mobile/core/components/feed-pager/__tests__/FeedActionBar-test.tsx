import { render, screen } from '@testing-library/react-native';

import { FeedActionBar } from '@/core/components/feed-pager/FeedActionBar';

describe('FeedActionBar', () => {
  test('shows Save and Tackle actions only', () => {
    render(
      <FeedActionBar
        pageBackgroundClassName="bg-card-issue"
        onSave={jest.fn()}
        onTackle={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tackle' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /pass/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /skip/i })).toBeNull();
  });
});
