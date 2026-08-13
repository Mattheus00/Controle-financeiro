"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ChartPeriod } from "@/types";

const PERIODS: Array<{ id: ChartPeriod; label: string }> = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "3m", label: "3 meses" },
  { id: "6m", label: "6 meses" },
  { id: "1y", label: "1 ano" },
];

export function PeriodPills() {
  const router = useRouter();
  const params = useSearchParams();
  const current = (params.get("period") as ChartPeriod) || "30d";

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Período do gráfico">
      {PERIODS.map((period) => (
        <button
          key={period.id}
          type="button"
          onClick={() => router.push(`/dashboard?period=${period.id}`)}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted",
            current === period.id && "bg-foreground text-background",
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
