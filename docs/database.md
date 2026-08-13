# Folio — banco de dados

Valores monetários usam `bigint` em **centavos**. Isso evita float no JavaScript e no Postgres.

## Tabelas

| Tabela | Função |
| --- | --- |
| `profiles` | Nome, moeda (BRL) e fuso do usuário |
| `user_preferences` | Tema e locale |
| `accounts` | Contas/carteiras |
| `credit_cards` | Cartões sem número completo |
| `categories` | Categorias por usuário (seed no cadastro) |
| `merchant_icon_rules` | Regras globais (`user_id` nulo) e do usuário |
| `transactions` | Receitas, despesas e transferências |
| `transaction_installments` | Metadados das parcelas |
| `bills` | Contas a pagar |
| `recurring_transactions` | Recorrências |
| `subscriptions` | Assinaturas |
| `budgets` | Orçamento mensal por categoria |
| `financial_goals` | Metas |
| `financial_goal_contributions` | Aportes nas metas |
| `attachments` | Metadados de comprovantes |
| `receipt_scans` | Resultado do OCR, nunca vira transação sozinho |

## Parcelas

A compra original fica com `installment_total` e `parent_transaction_id` nulo. As parcelas filhas têm `parent_transaction_id` preenchido. Relatórios somam só transações reportáveis: `installment_total IS NULL OR parent_transaction_id IS NOT NULL`.

## RLS

Todas as tabelas pessoais exigem `user_id = auth.uid()`. Regras globais de ícone (`user_id IS NULL`) são somente leitura para usuários autenticados.

## Storage

Bucket privado `receipts`, caminho `receipts/{user_id}/{transaction_id}/{arquivo}`. Políticas usam a primeira pasta do objeto como `auth.uid()`.

## Provisionamento

O trigger `private.handle_new_user` cria perfil, preferências, carteira e categorias padrão no cadastro.
