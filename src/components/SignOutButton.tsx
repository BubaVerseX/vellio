"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const { t } = useLocale();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} className="flex items-center justify-center gap-2">
      <LogOut strokeWidth={1.8} className="h-4 w-4" />
      {t.nav.signOut}
    </Button>
  );
}
