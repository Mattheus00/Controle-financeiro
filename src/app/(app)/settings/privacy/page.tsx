import { requireUser } from "@/lib/supabase/auth";
import { privacyService } from "@/services/privacy-service";
import { PrivacyCenter } from "@/features/privacy/privacy-center";
import { SettingsSubpage } from "@/features/profile/settings-subpage";
import {
  DATA_PROTECTION_CONTACT_EMAIL,
  DATA_PROTECTION_CONTACT_NAME,
} from "@/lib/privacy/config";

export default async function PrivacySettingsPage() {
  const { supabase, userId } = await requireUser();
  const [consents, requests] = await Promise.all([
    privacyService.listConsents(supabase, userId),
    privacyService.listPrivacyRequests(supabase, userId),
  ]);

  return (
    <SettingsSubpage title="Privacidade e dados" description="O que guardamos, e o que você pode pedir.">
      <PrivacyCenter
        consents={consents.success ? consents.data : []}
        requests={requests.success ? requests.data : []}
        contactName={DATA_PROTECTION_CONTACT_NAME}
        contactEmail={DATA_PROTECTION_CONTACT_EMAIL}
      />
    </SettingsSubpage>
  );
}
