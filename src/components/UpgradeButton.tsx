"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { initiatePremiumCheckout } from "@/lib/actions/premium";
import { Button } from "@/components/ui/Button";

export function UpgradeButton() {
  const { t } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<"comingSoon" | "alreadyActive" | null>(null);

  async function handleClick() {
    setLoading(true);
    const result = await initiatePremiumCheckout();
    setLoading(false);
    if ("alreadyActive" in result && result.alreadyActive) {
      setNotice("alreadyActive");
      router.refresh();
      return;
    }
    if ("comingSoon" in result && result.comingSoon) {
      setNotice("comingSoon");
      return;
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={handleClick} disabled={loading} className="w-full">
        {loading ? t.common.loading : t.premium.upgradeButton}
      </Button>
      {notice && (
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          {notice === "comingSoon" ? t.premium.comingSoon : t.premium.alreadyActive}
        </p>
      )}
    </div>
  );
}
