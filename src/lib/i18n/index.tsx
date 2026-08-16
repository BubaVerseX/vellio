"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import en, { type Dictionary } from "./dictionaries/en";
import ka from "./dictionaries/ka";

export type Locale = "en" | "ka";

const dictionaries: Record<Locale, Dictionary> = { en, ka };

const LOCALE_STORAGE_KEY = "vellio-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  // The server derives initialLocale from the "vellio-locale" cookie (see root
  // layout), so this only ever falls back to "en" on a visitor's very first
  // request before they've picked a language.
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? "en");

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.cookie = `${LOCALE_STORAGE_KEY}=${next}; path=/; max-age=31536000`;
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

export { format } from "./format";
