import Link from "next/link";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { isSubscriptionActive } from "@/lib/premium/access";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { LanguageSwitch } from "@/components/LanguageSwitch";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { t } = await getServerDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center gap-4">
        <Avatar name={profile?.full_name ?? user.email} size={64} className="text-2xl" />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{profile?.full_name}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard value={profile?.age ?? "—"} label={t.onboarding.age} />
        <StatCard value={profile?.weight_kg ?? "—"} label={t.onboarding.weight} />
        <StatCard value={profile?.height_cm ?? "—"} label={t.onboarding.height} />
      </div>

      <Card className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
          {t.profile.language}
        </span>
        <LanguageSwitch />
      </Card>

      <Link href="/upgrade">
        <Card className="flex items-center justify-between transition-all hover:translate-y-[-1px]">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Sparkles strokeWidth={1.8} className="h-4 w-4 text-[var(--color-accent)]" />
            {t.premium.manageEntry}
          </span>
          <span className="text-xs font-bold text-[var(--color-text-tertiary)]">
            {isSubscriptionActive(profile) ? t.premium.statusActive : t.premium.statusNone}
          </span>
        </Card>
      </Link>

      <Link href="/profile/edit">
        <Button className="w-full">{t.profile.editProfile}</Button>
      </Link>
    </div>
  );
}
