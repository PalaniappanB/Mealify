import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import ml from './locales/ml.json';
import mr from './locales/mr.json';
import ur from './locales/ur.json';

// Add new Indian languages here by dropping a new locale JSON file next to
// en.json and registering it below — no component changes needed.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ur', label: 'اردو' }
];

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
    ml: { translation: ml },
    mr: { translation: mr },
    ur: { translation: ur }
  },
  lng: 'en',
  fallbackLng: 'en',
  returnEmptyString: false,
  interpolation: { escapeValue: false }
});

export default i18n;
