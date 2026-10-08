import { useUIStore } from '../stores/useUIStore';
import { translations, TranslationKey, SupportedLanguage, SUPPORTED_LANGUAGES, LanguageInfo } from './translations';

export function useTranslation() {
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text: string = (langDict as any)[key] || (translations.en as any)[key] || key;

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }

    return text;
  };

  const currentLanguageInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return {
    t,
    language,
    setLanguage,
    currentLanguageInfo,
    languages: SUPPORTED_LANGUAGES
  };
}

export { SUPPORTED_LANGUAGES };
export type { SupportedLanguage, LanguageInfo, TranslationKey };
