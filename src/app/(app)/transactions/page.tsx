import { requireUser } from "@/lib/supabase/auth";
import { transactionService } from "@/services/transaction-service";
import { categoryService } from "@/services/catalog-service";
import { EmptyState, MoneyText } from "@/components/ui-kit";
import { EntityIcon } from "@/components/icons/entity-icon";
import { formatDateBR } from "@/lib/date";
import { PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from "@/types";
import { TransactionFilters } from "@/features/transactions/filters";
import { matchMerchantIcon } from "@/lib/icons";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, userId } = await requireUser();
  const [{ data: rules }, categories, result] = await Promise.all([
    supabase.from("merchant_icon_rules").select("pattern, icon"),
    categoryService.list(supabase, userId),
    transactionService.list(supabase, userId, {
      q: params.q,
      type: params.type as never,
      from: params.from,
      to: params.to,
    }),
  ]);

  const rows = result.success ? result.data : [];
  const categoryMap = new Map((categories.success ? categories.data : []).map((item) => [item.id, item]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Transações</h1>
        <p className="text-muted-foreground">Tudo o que entra e sai, em um lugar só.</p>
      </div>
      <TransactionFilters />
      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma transação ainda."
          description="Seu dinheiro ainda está misterioso por aqui."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const category = row.category_id ? categoryMap.get(row.category_id) : undefined;
            const icon =
              row.icon ||
              matchMerchantIcon(row.merchant, rules ?? []) ||
              category?.icon;
            return (
              <li key={row.id} className="flex items-center gap-3 rounded-3xl bg-card px-4 py-3 ring-1 ring-border">
                <EntityIcon name={icon} label={row.merchant || row.description} color={category?.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.merchant || row.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateBR(row.date)} · {TRANSACTION_TYPE_LABELS[row.type as keyof typeof TRANSACTION_TYPE_LABELS]}
                    {row.payment_method
                      ? ` · ${PAYMENT_METHOD_LABELS[row.payment_method as keyof typeof PAYMENT_METHOD_LABELS]}`
                      : ""}
                    {row.installment_number && row.installment_total
                      ? ` · ${row.installment_number}/${row.installment_total}`
                      : ""}
                  </p>
                </div>
                <MoneyText
                  cents={row.type === "income" ? row.amount_cents : -row.amount_cents}
                  className="text-lg"
                  tone={row.type === "income" ? "success" : "default"}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
