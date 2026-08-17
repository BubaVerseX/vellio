import Link from "next/link";
import { Utensils, Dumbbell, LineChart } from "lucide-react";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { ensureFeatureImages } from "@/lib/images/ensureFeatureImages";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BlobImage } from "@/components/ui/BlobImage";
import { ImageAttribution } from "@/components/ui/ImageAttribution";
import { LanguageSwitch } from "@/components/LanguageSwitch";

export default async function LandingPage() {
  const { t } = await getServerDictionary();
  const images = await ensureFeatureImages([
    { id: "hero_landing", query: "strength training athlete workout gym" },
  ]);
  const hero = images.get("hero_landing");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 md:px-8">
      <header className="flex items-center justify-between">
        <span className="text-xl font-extrabold tracking-tight">{t.common.appName}</span>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <Link href="/login">
            <Button variant="ghost" className="!px-4 !py-2 text-sm">
              {t.landing.login}
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-20 py-16 md:gap-28 md:py-24">
        <div className="gradient-wash-mixed relative -mx-5 flex flex-col items-center gap-10 rounded-[32px] px-5 py-12 md:mx-0 md:flex-row md:items-center md:gap-14 md:px-14 md:py-16">
          <div className="flex flex-1 flex-col items-center gap-6 text-center md:items-start md:text-left">
            <h1 className="text-[46px] leading-[0.98] font-extrabold tracking-[-0.03em] md:text-[76px]">
              {t.landing.headline}
            </h1>
            <p className="max-w-lg text-lg text-[var(--color-text-secondary)] md:text-xl">
              {t.landing.subhead}
            </p>
            <Link href="/get-started">
              <Button className="mt-2 !px-10 !py-5 text-lg">{t.landing.cta}</Button>
            </Link>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <BlobImage
              src={hero?.url}
              alt=""
              icon={Dumbbell}
              variant={1}
              className="h-64 w-64 md:h-[26rem] md:w-[26rem]"
              sizes="(min-width: 768px) 416px, 256px"
              preload
            />
            <ImageAttribution name={hero?.attributionName} url={hero?.attributionUrl} />
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
          <Card className="flex flex-col items-center gap-3 text-center">
            <BlobImage src={null} alt="" icon={Utensils} variant={1} className="h-16 w-16" />
            <h3 className="text-lg font-bold">{t.landing.feature1Title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{t.landing.feature1Body}</p>
          </Card>
          <Card className="flex flex-col items-center gap-3 text-center">
            <BlobImage src={null} alt="" icon={Dumbbell} variant={2} className="h-16 w-16" />
            <h3 className="text-lg font-bold">{t.landing.feature2Title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{t.landing.feature2Body}</p>
          </Card>
          <Card className="flex flex-col items-center gap-3 text-center">
            <BlobImage src={null} alt="" icon={LineChart} variant={3} className="h-16 w-16" />
            <h3 className="text-lg font-bold">{t.landing.feature3Title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{t.landing.feature3Body}</p>
          </Card>
        </div>
      </main>

      <footer className="flex flex-col items-center gap-3 py-6 text-center text-xs text-[var(--color-text-tertiary)] sm:flex-row sm:justify-center sm:gap-5">
        <Link href="/tips" className="underline underline-offset-2">
          {t.nav.tips}
        </Link>
        <Link href="/faq" className="underline underline-offset-2">
          {t.nav.faq}
        </Link>
        <Link href="/legal/disclaimer" className="underline underline-offset-2">
          {t.nav.disclaimer}
        </Link>
      </footer>
    </div>
  );
}
