"use client";

import Link from "next/link";
import { Utensils, Dumbbell, LineChart } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BlobImage } from "@/components/ui/BlobImage";
import { LanguageSwitch } from "@/components/LanguageSwitch";

export default function LandingPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-6 md:px-8">
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

      <main className="flex flex-1 flex-col items-center gap-10 py-12 md:py-20">
        <div className="flex max-w-2xl flex-col items-center gap-5 text-center">
          <h1 className="text-[44px] font-extrabold tracking-[-0.03em] md:text-[58px]">
            {t.landing.headline}
          </h1>
          <p className="max-w-lg text-base text-[var(--color-text-secondary)] md:text-lg">
            {t.landing.subhead}
          </p>
          <Link href="/signup">
            <Button className="mt-2 !px-8 !py-4 text-base">{t.landing.cta}</Button>
          </Link>
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

      <footer className="flex flex-col items-center gap-2 py-6 text-center text-xs text-[var(--color-text-tertiary)]">
        <Link href="/legal/disclaimer" className="underline underline-offset-2">
          {t.nav.disclaimer}
        </Link>
      </footer>
    </div>
  );
}
