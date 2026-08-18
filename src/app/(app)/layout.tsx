import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile && !profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar fullName={profile?.full_name ?? user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 md:px-8 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
