import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, MoneyText } from "@/components/ui-kit";
import { EntityIcon } from "@/components/icons/entity-icon";
import { MerchantIcon } from "@/components/merchant/MerchantIcon";
import { PeriodPills } from "@/features/dashboard/period-pills";
import { FlowChart } from "@/features/dashboard/flow-chart";
import { requireUser } from "@/lib/supabase/auth";
import { analyticsService } from "@/services/analytics-service";
import { formatBRL } from "@/lib/money";
import type { ChartPeriod } from "@/types";
import { Suspense } from "react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: periodParam } = await searchParams;
  const period = (["7d", "30d", "3m", "6m", "1y"].includes(periodParam ?? "")
    ? periodParam
    : "30d") as ChartPeriod;
  const { supabase, userId } = await requireUser();
  const data = await analyticsService.dashboard(supabase, userId, period);

  const uber = data.categories.find((item) => /uber/i.test(item.name));
  const insights = analyticsService.insights({
    expenseMonth: data.expenseMonth,
    expensePrev: data.expensePrev,
    incomeMonth: data.incomeMonth,
    subscriptionsMonth: data.subscriptionsMonth,
    categories: data.categories,
    uberCents: uber?.amount ?? 0,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Visão geral</p>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Seu mês, em paz.</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Saldo atual" cents={data.currentBalance} change={data.balanceChange} />
        <SummaryCard title="Entradas do mês" cents={data.incomeMonth} tone="success" />
        <SummaryCard title="Gastos do mês" cents={data.expenseMonth} tone="danger" />
        <SummaryCard title="Contas futuras" cents={data.upcomingBills} />
      </section>

      <Card className="rounded-3xl">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Entradas x saídas</CardTitle>
          <Suspense>
            <PeriodPills />
          </Suspense>
        </CardHeader>
        <CardContent>
          <FlowChart data={data.chart} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.categories.length === 0 ? (
              <EmptyState
                title="Nenhum gasto ainda."
                description="Seu dinheiro ainda está misterioso por aqui."
              />
            ) : (
              data.categories.slice(0, 6).map((category) => (
                <div key={category.slug} className="flex items-center gap-3">
                  <EntityIcon name={category.icon} color={category.color} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{category.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (category.amount / data.expenseMonth) * 100 || 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <MoneyText cents={category.amount} className="text-base" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Próximos 30 dias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Saldo atual" value={formatBRL(data.forecast.currentBalance)} />
            <Row label="Receitas previstas" value={`+ ${formatBRL(data.forecast.expectedIncome)}`} />
            <Row label="Despesas previstas" value={`- ${formatBRL(data.forecast.expectedExpenses)}`} />
            <div className="border-t pt-3">
              <Row label="Saldo previsto" value={formatBRL(data.forecast.projected)} strong />
            </div>
            <div className="space-y-2 pt-4">
              {insights.map((insight) => (
                <p key={insight.id} className="rounded-2xl bg-muted px-3 py-2 text-muted-foreground">
                  {insight.message}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Movimentações recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.recent.length === 0 ? (
            <EmptyState
              title="Nenhuma movimentação ainda."
              description="Quando você lançar gastos, eles aparecem aqui."
            />
          ) : (
            data.recent.map((row, index) => (
              <div key={`${row.date}-${row.merchant}-${index}`} className="flex items-center gap-3">
                <MerchantIcon name={row.merchant} category={row.categorySlug ?? row.categoryName ?? undefined} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.merchant}</p>
                </div>
                <MoneyText
                  cents={row.type === "income" ? row.amount_cents : -row.amount_cents}
                  className="text-base"
                  tone={row.type === "income" ? "success" : "default"}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  cents,
  change,
  tone,
}: {
  title: string;
  cents: number;
  change?: number | null;
  tone?: "success" | "danger";
}) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <p className="text-sm text-muted-foreground">{title}</p>
        <MoneyText cents={cents} className="text-[clamp(1.5rem,7vw,1.875rem)]" tone={tone} />
        {change != null ? (
          <p className="text-xs text-muted-foreground">
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}% comparado ao mês passado.
          </p>
        ) : null}
      </CardHeader>
    </Card>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="min-w-0 text-muted-foreground">{label}</span>
      <span className={strong ? "shrink-0 text-right font-display text-xl tabular-nums" : "shrink-0 text-right font-medium tabular-nums"}>
        {value}
      </span>
    </div>
  );
}

