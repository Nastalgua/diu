import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createSessionFeedStorage,
  type SessionFeedStorage,
} from '@/core/session/session-feed-storage';

let defaultStorage: SessionFeedStorage | null = null;

export function getDefaultSessionFeedStorage(): SessionFeedStorage {
  if (!defaultStorage) {
    defaultStorage = createSessionFeedStorage(AsyncStorage);
  }

  return defaultStorage;
}
