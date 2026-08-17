import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { Card } from "@/components/ui/Card";

export async function FreePreviewBanner() {
  const { t } = await getServerDictionary();

  return (
    <Link href="/upgrade">
      <Card className="flex items-center gap-3 transition-all hover:translate-y-[-1px]">
        <div className="soft-pressed flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Sparkles strokeWidth={1.8} className="h-4 w-4 text-[var(--color-accent)]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">{t.premium.freePreviewTitle}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{t.premium.freePreviewBody}</p>
        </div>
      </Card>
    </Link>
  );
}
