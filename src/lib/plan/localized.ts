import type { Locale } from "@/lib/i18n";

export function localizedField<T extends Record<string, unknown>>(
  item: T,
  baseKey: keyof T,
  kaKey: keyof T,
  locale: Locale
): string {
  if (locale === "ka") {
    const kaValue = item[kaKey];
    if (typeof kaValue === "string" && kaValue.trim()) return kaValue;
  }
  return String(item[baseKey] ?? "");
}
