import { cookies } from "next/headers";
import type { Locale } from "./index";
import en from "./dictionaries/en";
import ka from "./dictionaries/ka";

const dictionaries = { en, ka };

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("vellio-locale")?.value;
  return value === "ka" ? "ka" : "en";
}

export async function getServerDictionary() {
  const locale = await getServerLocale();
  return { locale, t: dictionaries[locale] };
}
