import { requireUser } from "@/lib/supabase/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DesktopQuickAdd } from "@/features/transactions/quick-add";
import { recurringService } from "@/services/recurring-service";
import { PresenceTracker } from "@/features/admin/presence-tracker";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, userId } = await requireUser();
  const [{ data: profile }, { data: userData }] = await Promise.all([
    supabase.from("profiles").select("name").eq("user_id", userId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  await recurringService.generateUpcoming(supabase, userId);

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <PresenceTracker userId={userId} />
      <AppSidebar
        name={profile?.name || "Você"}
        email={userData.user?.email ?? ""}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 hidden items-center justify-end gap-3 border-b border-transparent bg-background/80 px-8 py-4 backdrop-blur lg:flex">
          <DesktopQuickAdd />
        </header>
        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(6.75rem+env(safe-area-inset-bottom))] lg:px-8 lg:pb-10 lg:pt-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
