import { requireUser } from "@/lib/supabase/auth";
import { transactionService } from "@/services/transaction-service";
import { categoryService, cardService } from "@/services/catalog-service";
import { EmptyState, MoneyText } from "@/components/ui-kit";
import { MerchantLogo } from "@/components/merchant/MerchantLogo";
import { formatDateBR } from "@/lib/date";
import { PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from "@/types";
import { TransactionFilters } from "@/features/transactions/filters";
import { transactionFilterSchema } from "@/validations/transaction";
import { creditCardLabel } from "@/features/cards/card-label";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filters = transactionFilterSchema.safeParse({
    q: params.q || undefined,
    type: params.type || undefined,
    from: params.from || undefined,
    to: params.to || undefined,
  });
  const { supabase, userId } = await requireUser();
  const [categories, cards, result] = await Promise.all([
    categoryService.list(supabase, userId),
    cardService.listOptions(supabase, userId),
    transactionService.list(supabase, userId, filters.success ? filters.data : {}),
  ]);

  const rows = result.success ? result.data : [];
  const categoryMap = new Map((categories.success ? categories.data : []).map((item) => [item.id, item]));
  const cardMap = new Map((cards.success ? cards.data : []).map((item) => [item.id, item]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Transações</h1>
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
            const card = row.credit_card_id ? cardMap.get(row.credit_card_id) : undefined;
            return (
              <li key={row.id} className="flex items-center gap-3 rounded-3xl bg-card px-4 py-3 ring-1 ring-border">
                <MerchantLogo
                  merchantName={row.merchant || row.description}
                  category={category?.slug}
                  categoryIcon={row.icon || category?.icon}
                  categoryColor={category?.color}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{row.merchant || row.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateBR(row.date)}
                    <span className="block sm:inline">
                      {" "}
                      · {TRANSACTION_TYPE_LABELS[row.type as keyof typeof TRANSACTION_TYPE_LABELS]}
                      {row.payment_method
                        ? ` · ${PAYMENT_METHOD_LABELS[row.payment_method as keyof typeof PAYMENT_METHOD_LABELS]}`
                        : ""}
                      {card ? ` · ${creditCardLabel(card)}` : ""}
                      {row.installment_number && row.installment_total
                        ? ` · ${row.installment_number}/${row.installment_total}`
                        : ""}
                    </span>
                  </p>
                </div>
                <MoneyText
                  cents={row.type === "income" ? row.amount_cents : -row.amount_cents}
                  className="self-start text-lg sm:self-center"
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
