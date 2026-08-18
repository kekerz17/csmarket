import { createContext, useContext, useState, type ReactNode } from 'react';

export type Language = 'ru' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const STORAGE_KEY = 'language';

function detectDefault(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'en' ? 'en' : 'ru';
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ru',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDefault);

  function setLanguage(next: Language) {
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
