import { requireUser } from "@/lib/supabase/auth";
import { billService } from "@/services/bill-service";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoneyText } from "@/components/ui-kit";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";

export default async function CalendarPage() {
  const { supabase, userId } = await requireUser();
  const today = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });
  const bills = await billService.list(supabase, userId);
  const items = bills.success ? bills.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Calendário</h1>
        <p className="capitalize text-muted-foreground">{format(today, "MMMM yyyy", { locale: ptBR })}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const dayBills = items.filter((bill) => bill.due_date === iso && bill.status !== "paid");
          return (
            <div key={iso} className="min-h-28 rounded-3xl bg-card p-3 ring-1 ring-border">
              <p className="text-sm text-muted-foreground">{format(day, "d")}</p>
              <div className="mt-2 space-y-2">
                {dayBills.map((bill) => (
                  <div key={bill.id} className="flex items-center gap-2">
                    <MerchantLogo merchantName={bill.name} categoryIcon={bill.icon} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{bill.name}</p>
                      <MoneyText cents={bill.amount_cents} className="text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
