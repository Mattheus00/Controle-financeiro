import { requireUser } from "@/lib/supabase/auth";
import { profileService } from "@/services/catalog-service";
import { ProfileHub } from "@/features/profile/profile-hub";

export default async function SettingsPage() {
  const { supabase, userId } = await requireUser();
  const [profile, userResult] = await Promise.all([
    profileService.get(supabase, userId),
    supabase.auth.getUser(),
  ]);
  const name = profile.success ? profile.data.profile?.name ?? "" : "";

  return <ProfileHub name={name} email={userResult.data.user?.email ?? ""} />;
}
