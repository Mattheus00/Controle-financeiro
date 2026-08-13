-- Folio: schema inicial, RLS, storage e seed de regras globais.
-- Valores monetários em centavos (bigint) para evitar float.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  avatar_url text,
  currency text NOT NULL DEFAULT 'BRL',
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light',
  locale text NOT NULL DEFAULT 'pt-BR',
  week_starts_on smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_theme_check CHECK (theme IN ('light', 'dark', 'system')),
  CONSTRAINT user_preferences_week_check CHECK (week_starts_on BETWEEN 0 AND 6)
);

CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'checking',
  initial_balance_cents bigint NOT NULL DEFAULT 0,
  color text,
  icon text,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT accounts_type_check CHECK (
    type IN ('checking', 'savings', 'cash', 'wallet', 'investment', 'other')
  )
);

CREATE TABLE public.credit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  last_four text,
  limit_cents bigint,
  closing_day smallint NOT NULL,
  due_day smallint NOT NULL,
  color text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT credit_cards_last_four_check CHECK (last_four IS NULL OR last_four ~ '^\d{4}$'),
  CONSTRAINT credit_cards_closing_day_check CHECK (closing_day BETWEEN 1 AND 28),
  CONSTRAINT credit_cards_due_day_check CHECK (due_day BETWEEN 1 AND 28)
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  type text NOT NULL DEFAULT 'expense',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_type_check CHECK (type IN ('expense', 'income', 'both')),
  CONSTRAINT categories_user_slug_unique UNIQUE (user_id, slug)
);

CREATE TABLE public.merchant_icon_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  pattern text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL,
  description text NOT NULL,
  amount_cents bigint NOT NULL,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.accounts (id) ON DELETE SET NULL,
  credit_card_id uuid REFERENCES public.credit_cards (id) ON DELETE SET NULL,
  payment_method text,
  merchant text,
  icon text,
  frequency text NOT NULL,
  interval_count smallint NOT NULL DEFAULT 1,
  day_of_month smallint,
  weekday smallint,
  start_date date NOT NULL,
  end_date date,
  next_occurrence date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  generate_as text NOT NULL DEFAULT 'bill',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recurring_type_check CHECK (type IN ('income', 'expense')),
  CONSTRAINT recurring_frequency_check CHECK (
    frequency IN ('weekly', 'monthly', 'quarterly', 'semiannual', 'yearly', 'custom')
  ),
  CONSTRAINT recurring_generate_as_check CHECK (generate_as IN ('bill', 'transaction')),
  CONSTRAINT recurring_amount_positive CHECK (amount_cents > 0)
);

CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type text NOT NULL,
  description text NOT NULL,
  amount_cents bigint NOT NULL,
  date date NOT NULL,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.accounts (id) ON DELETE SET NULL,
  credit_card_id uuid REFERENCES public.credit_cards (id) ON DELETE SET NULL,
  destination_account_id uuid REFERENCES public.accounts (id) ON DELETE SET NULL,
  payment_method text,
  merchant text,
  notes text,
  is_recurring boolean NOT NULL DEFAULT false,
  recurring_transaction_id uuid REFERENCES public.recurring_transactions (id) ON DELETE SET NULL,
  parent_transaction_id uuid REFERENCES public.transactions (id) ON DELETE SET NULL,
  installment_number smallint,
  installment_total smallint,
  icon text,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_type_check CHECK (type IN ('income', 'expense', 'transfer')),
  CONSTRAINT transactions_payment_method_check CHECK (
    payment_method IS NULL OR payment_method IN (
      'pix', 'cash', 'debit', 'credit', 'boleto', 'transfer', 'other'
    )
  ),
  CONSTRAINT transactions_amount_positive CHECK (amount_cents > 0)
);

CREATE TABLE public.transaction_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  parent_transaction_id uuid NOT NULL REFERENCES public.transactions (id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.transactions (id) ON DELETE SET NULL,
  number smallint NOT NULL,
  total smallint NOT NULL,
  amount_cents bigint NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT installments_status_check CHECK (status IN ('pending', 'paid', 'cancelled')),
  CONSTRAINT installments_amount_positive CHECK (amount_cents > 0)
);

CREATE TABLE public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  amount_cents bigint NOT NULL,
  due_date date NOT NULL,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.accounts (id) ON DELETE SET NULL,
  credit_card_id uuid REFERENCES public.credit_cards (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  icon text,
  notes text,
  recurring_transaction_id uuid REFERENCES public.recurring_transactions (id) ON DELETE SET NULL,
  paid_transaction_id uuid REFERENCES public.transactions (id) ON DELETE SET NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bills_status_check CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  CONSTRAINT bills_amount_positive CHECK (amount_cents > 0)
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  amount_cents bigint NOT NULL,
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.accounts (id) ON DELETE SET NULL,
  credit_card_id uuid REFERENCES public.credit_cards (id) ON DELETE SET NULL,
  billing_day smallint NOT NULL,
  icon text,
  merchant text,
  is_active boolean NOT NULL DEFAULT true,
  recurring_transaction_id uuid REFERENCES public.recurring_transactions (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_billing_day_check CHECK (billing_day BETWEEN 1 AND 28),
  CONSTRAINT subscriptions_amount_positive CHECK (amount_cents > 0)
);

CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories (id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL,
  month date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budgets_amount_positive CHECK (amount_cents > 0),
  CONSTRAINT budgets_user_category_month_unique UNIQUE (user_id, category_id, month)
);

CREATE TABLE public.financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  target_cents bigint NOT NULL,
  current_cents bigint NOT NULL DEFAULT 0,
  deadline date,
  icon text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT goals_target_positive CHECK (target_cents > 0)
);

CREATE TABLE public.financial_goal_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES public.financial_goals (id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL,
  contributed_at date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contributions_amount_nonzero CHECK (amount_cents <> 0)
);

CREATE TABLE public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.transactions (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  original_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attachments_size_check CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  CONSTRAINT attachments_mime_check CHECK (
    mime_type IN (
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    )
  )
);

CREATE TABLE public.receipt_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  attachment_id uuid REFERENCES public.attachments (id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  status text NOT NULL DEFAULT 'processing',
  extracted jsonb,
  confidence numeric(4, 3),
  transaction_id uuid REFERENCES public.transactions (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT receipt_scans_status_check CHECK (status IN ('processing', 'completed', 'failed'))
);

-- Índices
CREATE INDEX idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX idx_accounts_user_id ON public.accounts (user_id);
CREATE INDEX idx_credit_cards_user_id ON public.credit_cards (user_id);
CREATE INDEX idx_categories_user_id ON public.categories (user_id);
CREATE INDEX idx_merchant_icon_rules_user_id ON public.merchant_icon_rules (user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX idx_transactions_date ON public.transactions (user_id, date DESC);
CREATE INDEX idx_transactions_category ON public.transactions (user_id, category_id);
CREATE INDEX idx_transactions_account ON public.transactions (user_id, account_id);
CREATE INDEX idx_transactions_credit_card ON public.transactions (user_id, credit_card_id);
CREATE INDEX idx_transactions_type ON public.transactions (user_id, type);
CREATE INDEX idx_installments_user_id ON public.transaction_installments (user_id);
CREATE INDEX idx_installments_parent ON public.transaction_installments (parent_transaction_id);
CREATE INDEX idx_bills_user_id ON public.bills (user_id);
CREATE INDEX idx_bills_due_date ON public.bills (user_id, due_date);
CREATE INDEX idx_bills_status ON public.bills (user_id, status);
CREATE INDEX idx_recurring_user_id ON public.recurring_transactions (user_id);
CREATE INDEX idx_recurring_next ON public.recurring_transactions (user_id, next_occurrence) WHERE is_active;
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions (user_id);
CREATE INDEX idx_budgets_user_month ON public.budgets (user_id, month);
CREATE INDEX idx_budgets_category ON public.budgets (user_id, category_id);
CREATE INDEX idx_goals_user_id ON public.financial_goals (user_id);
CREATE INDEX idx_goal_contributions_user_id ON public.financial_goal_contributions (user_id);
CREATE INDEX idx_attachments_user_id ON public.attachments (user_id);
CREATE INDEX idx_attachments_transaction ON public.attachments (transaction_id);
CREATE INDEX idx_receipt_scans_user_id ON public.receipt_scans (user_id);
CREATE INDEX idx_receipt_scans_created ON public.receipt_scans (user_id, created_at DESC);

-- updated_at
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_accounts_updated_at BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_credit_cards_updated_at BEFORE UPDATE ON public.credit_cards
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_bills_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_recurring_updated_at BEFORE UPDATE ON public.recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_budgets_updated_at BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();
CREATE TRIGGER trg_receipt_scans_updated_at BEFORE UPDATE ON public.receipt_scans
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

-- Provisionamento do usuário
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name text;
BEGIN
  display_name := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'name', ''),
    split_part(NEW.email, '@', 1),
    'Você'
  );

  INSERT INTO public.profiles (user_id, name, currency, timezone)
  VALUES (NEW.id, display_name, 'BRL', 'America/Sao_Paulo');

  INSERT INTO public.user_preferences (user_id, theme, locale)
  VALUES (NEW.id, 'light', 'pt-BR');

  INSERT INTO public.accounts (user_id, name, type, icon, color)
  VALUES (NEW.id, 'Carteira', 'wallet', 'Wallet', '#A3E635');

  INSERT INTO public.categories (user_id, name, slug, icon, color, type, is_default)
  VALUES
    (NEW.id, 'Alimentação', 'alimentacao', 'Utensils', '#84CC16', 'expense', true),
    (NEW.id, 'Mercado', 'mercado', 'ShoppingCart', '#65A30D', 'expense', true),
    (NEW.id, 'Moradia', 'moradia', 'House', '#15803D', 'expense', true),
    (NEW.id, 'Transporte', 'transporte', 'Car', '#0EA5E9', 'expense', true),
    (NEW.id, 'Combustível', 'combustivel', 'Fuel', '#F97316', 'expense', true),
    (NEW.id, 'Saúde', 'saude', 'HeartPulse', '#EF4444', 'expense', true),
    (NEW.id, 'Academia', 'academia', 'Dumbbell', '#A855F7', 'expense', true),
    (NEW.id, 'Lazer', 'lazer', 'Gamepad2', '#EC4899', 'expense', true),
    (NEW.id, 'Assinaturas', 'assinaturas', 'RefreshCw', '#6366F1', 'expense', true),
    (NEW.id, 'Educação', 'educacao', 'GraduationCap', '#2563EB', 'expense', true),
    (NEW.id, 'Compras', 'compras', 'ShoppingBag', '#F59E0B', 'expense', true),
    (NEW.id, 'Viagens', 'viagens', 'Plane', '#14B8A6', 'expense', true),
    (NEW.id, 'Investimentos', 'investimentos', 'TrendingUp', '#22C55E', 'both', true),
    (NEW.id, 'Impostos', 'impostos', 'Landmark', '#78716C', 'expense', true),
    (NEW.id, 'Presentes', 'presentes', 'Gift', '#F43F5E', 'expense', true),
    (NEW.id, 'Pets', 'pets', 'PawPrint', '#D97706', 'expense', true),
    (NEW.id, 'Trabalho', 'trabalho', 'Briefcase', '#475569', 'both', true),
    (NEW.id, 'Salário', 'salario', 'Banknote', '#16A34A', 'income', true),
    (NEW.id, 'Outros', 'outros', 'CircleDot', '#94A3B8', 'both', true);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_icon_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_preferences_select_own ON public.user_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY user_preferences_insert_own ON public.user_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY user_preferences_update_own ON public.user_preferences FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_preferences_delete_own ON public.user_preferences FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY accounts_select_own ON public.accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY accounts_insert_own ON public.accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY accounts_update_own ON public.accounts FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY accounts_delete_own ON public.accounts FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY credit_cards_select_own ON public.credit_cards FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY credit_cards_insert_own ON public.credit_cards FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY credit_cards_update_own ON public.credit_cards FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY credit_cards_delete_own ON public.credit_cards FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY categories_select_own ON public.categories FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY categories_insert_own ON public.categories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_update_own ON public.categories FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_delete_own ON public.categories FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY merchant_icon_rules_select ON public.merchant_icon_rules FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY merchant_icon_rules_insert_own ON public.merchant_icon_rules FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY merchant_icon_rules_update_own ON public.merchant_icon_rules FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY merchant_icon_rules_delete_own ON public.merchant_icon_rules FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY transactions_select_own ON public.transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY transactions_insert_own ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY transactions_update_own ON public.transactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY transactions_delete_own ON public.transactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY installments_select_own ON public.transaction_installments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY installments_insert_own ON public.transaction_installments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY installments_update_own ON public.transaction_installments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY installments_delete_own ON public.transaction_installments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY bills_select_own ON public.bills FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY bills_insert_own ON public.bills FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY bills_update_own ON public.bills FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY bills_delete_own ON public.bills FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY recurring_select_own ON public.recurring_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY recurring_insert_own ON public.recurring_transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY recurring_update_own ON public.recurring_transactions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY recurring_delete_own ON public.recurring_transactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY subscriptions_select_own ON public.subscriptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY subscriptions_insert_own ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY subscriptions_update_own ON public.subscriptions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY subscriptions_delete_own ON public.subscriptions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY budgets_select_own ON public.budgets FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY budgets_insert_own ON public.budgets FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY budgets_update_own ON public.budgets FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY budgets_delete_own ON public.budgets FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY goals_select_own ON public.financial_goals FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY goals_insert_own ON public.financial_goals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY goals_update_own ON public.financial_goals FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY goals_delete_own ON public.financial_goals FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY contributions_select_own ON public.financial_goal_contributions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY contributions_insert_own ON public.financial_goal_contributions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY contributions_update_own ON public.financial_goal_contributions FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY contributions_delete_own ON public.financial_goal_contributions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY attachments_select_own ON public.attachments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY attachments_insert_own ON public.attachments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY attachments_update_own ON public.attachments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY attachments_delete_own ON public.attachments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY receipt_scans_select_own ON public.receipt_scans FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY receipt_scans_insert_own ON public.receipt_scans FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY receipt_scans_update_own ON public.receipt_scans FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY receipt_scans_delete_own ON public.receipt_scans FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Storage: bucket privado de comprovantes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY receipts_select_own ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY receipts_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY receipts_update_own ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY receipts_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'receipts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Regras globais de ícone (user_id nulo = visível para todos)
INSERT INTO public.merchant_icon_rules (user_id, pattern, icon) VALUES
  (NULL, 'netflix', 'Tv'),
  (NULL, 'spotify', 'Music'),
  (NULL, 'uber', 'Car'),
  (NULL, '99', 'Car'),
  (NULL, 'ifood', 'Utensils'),
  (NULL, 'rappi', 'Utensils'),
  (NULL, 'smart fit', 'Dumbbell'),
  (NULL, 'smartfit', 'Dumbbell'),
  (NULL, 'posto', 'Fuel'),
  (NULL, 'shell', 'Fuel'),
  (NULL, 'ipiranga', 'Fuel'),
  (NULL, 'petrobras', 'Fuel'),
  (NULL, 'verdemar', 'ShoppingCart'),
  (NULL, 'carrefour', 'ShoppingCart'),
  (NULL, 'pao de acucar', 'ShoppingCart'),
  (NULL, 'pão de açúcar', 'ShoppingCart'),
  (NULL, 'assai', 'ShoppingCart'),
  (NULL, 'atacadão', 'ShoppingCart'),
  (NULL, 'mercado livre', 'ShoppingBag'),
  (NULL, 'amazon', 'ShoppingBag'),
  (NULL, 'shopee', 'ShoppingBag'),
  (NULL, 'nubank', 'CreditCard'),
  (NULL, 'inter', 'CreditCard'),
  (NULL, 'itau', 'Landmark'),
  (NULL, 'itaú', 'Landmark'),
  (NULL, 'bradesco', 'Landmark'),
  (NULL, 'chatgpt', 'Sparkles'),
  (NULL, 'openai', 'Sparkles'),
  (NULL, 'icloud', 'Cloud'),
  (NULL, 'apple', 'Smartphone'),
  (NULL, 'google one', 'Cloud'),
  (NULL, 'youtube', 'Tv'),
  (NULL, 'disney', 'Tv'),
  (NULL, 'prime video', 'Tv'),
  (NULL, 'hbo', 'Tv'),
  (NULL, 'max', 'Tv'),
  (NULL, 'aluguel', 'House'),
  (NULL, 'energia', 'Zap'),
  (NULL, 'cemig', 'Zap'),
  (NULL, 'enel', 'Zap'),
  (NULL, 'copasa', 'Droplets'),
  (NULL, 'água', 'Droplets'),
  (NULL, 'agua', 'Droplets'),
  (NULL, 'internet', 'Wifi'),
  (NULL, 'vivo', 'Wifi'),
  (NULL, 'claro', 'Wifi'),
  (NULL, 'tim', 'Smartphone'),
  (NULL, 'farmacia', 'HeartPulse'),
  (NULL, 'farmácia', 'HeartPulse'),
  (NULL, 'droga', 'HeartPulse'),
  (NULL, 'raia', 'HeartPulse');
