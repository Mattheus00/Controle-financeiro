import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { requireAdmin } from "@/lib/supabase/auth";
import { adminService } from "@/services/admin-service";

export default async function AdminPage() {
  const { supabase, userId } = await requireAdmin();
  const dashboard = await adminService.getDashboard(supabase);

  return <AdminDashboard {...dashboard} adminUserId={userId} />;
}
