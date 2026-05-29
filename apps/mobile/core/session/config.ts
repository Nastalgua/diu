import Constants from 'expo-constants';

function isLocalhostUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

function replaceHost(url: string, host: string): string {
  const parsed = new URL(url);
  parsed.hostname = host;
  return parsed.origin;
}

function getExpoDevHost(): string | undefined {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.expoConfig?.hostUri?.split(':')[0];

  if (!debuggerHost || debuggerHost === 'localhost') {
    return undefined;
  }

  return debuggerHost.split(':')[0];
}

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

  if (__DEV__) {
    const devHost = getExpoDevHost();
    if (devHost && isLocalhostUrl(configured)) {
      return replaceHost(configured, devHost);
    }
  }

  return configured;
}

export function shouldUseFakeFeed(): boolean {
  return (
    process.env.EXPO_PUBLIC_USE_FAKE_FEED === 'true' ||
    process.env.NODE_ENV === 'test'
  );
}

export const PREFETCH_THRESHOLD = 2;
