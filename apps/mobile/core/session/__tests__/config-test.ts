jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoGoConfig: { debuggerHost: '192.168.1.163:8081' },
    expoConfig: { hostUri: '192.168.1.163:8081' },
  },
}));

import { getApiBaseUrl } from '@/core/session/config';

describe('getApiBaseUrl', () => {
  const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.EXPO_PUBLIC_API_URL;
    } else {
      process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    }
  });

  test('rewrites localhost to the Expo dev host on a physical device', () => {
    process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000';

    expect(getApiBaseUrl()).toBe('http://192.168.1.163:3000');
  });
});
