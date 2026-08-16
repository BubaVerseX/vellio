import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getServerDictionary } from "@/lib/i18n/serverLocale";
import { TemplateGallery } from "@/components/TemplateGallery";

export default async function WorkoutTemplatesPage() {
  const supabase = await createClient();
  const { t } = await getServerDictionary();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("equipment_setting")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col gap-6 py-6">
      <Link
        href="/workouts"
        className="flex w-fit items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"
      >
        <ArrowLeft strokeWidth={1.8} className="h-4 w-4" />
        {t.workouts.title}
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">{t.templates.title}</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">{t.templates.subtitle}</p>
      </div>

      <TemplateGallery userEquipment={profile?.equipment_setting ?? null} />
    </div>
  );
}
