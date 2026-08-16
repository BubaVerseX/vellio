"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";

export default function LoginPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(t.auth.invalidCredentials);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.onboarding_completed ? "/home" : "/onboarding");
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{t.auth.loginTitle}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-sm font-medium text-[var(--color-accent)]">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? t.common.loading : t.auth.loginButton}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        {t.auth.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-[var(--color-accent)]">
          {t.auth.signupLink}
        </Link>
      </p>
    </Card>
  );
}
