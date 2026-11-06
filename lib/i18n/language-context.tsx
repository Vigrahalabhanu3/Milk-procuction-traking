"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, TranslationDictionary, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

const STORAGE_KEY = "dairyflow_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const timer = window.setTimeout(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && (saved === "en" || saved === "te")) {
        setLanguageState(saved);
      }
    } catch {
      // localStorage may fail in restricted privacy mode
    }

    }, 0);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "en" || e.newValue === "te")) {
        setLanguageState(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => { window.clearTimeout(timer); window.removeEventListener("storage", handleStorageChange); };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      // Dispatch custom event for cross-component sync within the same tab
      window.dispatchEvent(new CustomEvent("dairyflow_lang_change", { detail: lang }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail && (customEvent.detail === "en" || customEvent.detail === "te")) {
        setLanguageState(customEvent.detail);
      }
    };
    window.addEventListener("dairyflow_lang_change", handleCustomChange);
    return () => window.removeEventListener("dairyflow_lang_change", handleCustomChange);
  }, []);

  const currentTranslations = translations[language] || translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
