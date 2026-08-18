import { Anton, Noto_Sans_Georgian, JetBrains_Mono } from "next/font/google";

/** Oversized Latin display face — numbers and short English slogans only. */
export const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

/** The workhorse — carries all Georgian text and all UI labels, in both locales. */
export const notoSansGeorgian = Noto_Sans_Georgian({
  weight: ["400", "700", "800", "900"],
  subsets: ["georgian", "latin"],
  variable: "--font-georgian",
  display: "swap",
});

/** Metadata, units, dates, section kickers, placeholder values. */
export const jetbrainsMono = JetBrains_Mono({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-mono-label",
  display: "swap",
});
