import Constants from 'expo-constants';

// Deployed backend — what standalone builds (APK/iOS) and any published
// Expo Go link use, since they have no local dev server to detect.
const PRODUCTION_API_URL = 'https://mealify-api.onrender.com/api';

// While running via `expo start` + Expo Go on a LAN, auto-detect the dev
// machine's IP instead so local backend changes are visible without a rebuild.
// Override either behavior by setting EXPO_PUBLIC_API_URL.
function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || Constants.manifest2?.extra?.expoClient?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:4000/api`;
    }
  }

  return PRODUCTION_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
