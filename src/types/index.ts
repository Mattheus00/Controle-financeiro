export type TransactionType = "income" | "expense" | "transfer";
export type PaymentMethod =
  | "pix"
  | "cash"
  | "debit"
  | "credit"
  | "boleto"
  | "transfer"
  | "other";
export type BillStatus = "pending" | "paid" | "overdue" | "cancelled";
export type CategoryType = "expense" | "income" | "both";
export type RecurringFrequency =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "yearly"
  | "custom";
export type AccountType =
  | "checking"
  | "savings"
  | "cash"
  | "wallet"
  | "investment"
  | "other";
export type ChartPeriod = "7d" | "30d" | "3m" | "6m" | "1y";
export type BudgetTone = "normal" | "attention" | "near" | "exceeded";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
  boleto: "Boleto",
  transfer: "Transferência",
  other: "Outros",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
  transfer: "Transferência",
};

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  cash: "Dinheiro",
  wallet: "Carteira",
  investment: "Investimento",
  other: "Outra",
};

export const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  yearly: "Anual",
  custom: "Personalizado",
};

export type ReceiptExtraction = {
  merchant: string | null;
  description: string | null;
  amount: number | null;
  date: string | null;
  payment_method: PaymentMethod | null;
  installments: number | null;
  document_number: string | null;
  cnpj: string | null;
  suggested_category: string | null;
  confidence: number;
};

export type Insight = {
  id: string;
  message: string;
};
