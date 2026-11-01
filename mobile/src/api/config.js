import Constants from 'expo-constants';

// Auto-detect the dev machine's LAN IP from the Expo Go connection so the app
// works out of the box on a physical phone without hardcoding an IP address.
// Override by setting EXPO_PUBLIC_API_URL before running `expo start` if needed.
function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  const hostUri =
    Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:4000/api`;
  }

  return 'http://localhost:4000/api';
}

export const API_BASE_URL = resolveApiBaseUrl();
