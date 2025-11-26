import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations } from '../services/translations';
import { Language } from '../types';

type TranslateFunction = (key: string, replacements?: { [key: string]: string | number }) => string;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslateFunction;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode; userLanguage: Language | undefined }> = ({ children, userLanguage }) => {
  const [language, setLanguage] = useState<Language>(userLanguage || 'en');

  useEffect(() => {
    setLanguage(userLanguage || 'en');
  }, [userLanguage]);

  const t: TranslateFunction = (key, replacements = {}) => {
    let translation = (translations[language] && translations[language][key]) || translations['en'][key] || key;
    
    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      translation = translation.replace(regex, String(replacements[placeholder]));
    });

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
