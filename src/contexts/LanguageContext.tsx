import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { translations, Language, formatTranslation } from '../i18n/translations';
import { translationOverrides } from '../i18n/translationOverrides';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'bookhouse_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    return savedLanguage && savedLanguage in translations ? savedLanguage : 'ru';
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    t: (key, params) => {
      const baseTranslations = translations[language] as Record<string, string>;
      const template = translationOverrides[language][key] ?? baseTranslations[key] ?? key;
      return formatTranslation(template, params);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
};
