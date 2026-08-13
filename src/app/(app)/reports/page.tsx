import { requireUser } from "@/lib/supabase/auth";
import { analyticsService } from "@/services/analytics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntityIcon } from "@/components/icons/entity-icon";
import { MoneyText } from "@/components/ui-kit";

export default async function ReportsPage() {
  const { supabase, userId } = await requireUser();
  const data = await analyticsService.dashboard(supabase, userId, "1y");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Uma leitura calma do ano.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Entradas do mês</p>
            <MoneyText cents={data.incomeMonth} className="text-3xl" tone="success" />
          </CardHeader>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Saídas do mês</p>
            <MoneyText cents={data.expenseMonth} className="text-3xl" tone="danger" />
          </CardHeader>
        </Card>
        <Card className="rounded-3xl">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Assinaturas / ano</p>
            <MoneyText cents={data.subscriptionsYear} className="text-3xl" />
          </CardHeader>
        </Card>
      </div>
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.categories.map((category) => (
            <div key={category.slug} className="flex items-center gap-3">
              <EntityIcon name={category.icon} color={category.color} />
              <p className="flex-1 font-medium">{category.name}</p>
              <MoneyText cents={category.amount} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
