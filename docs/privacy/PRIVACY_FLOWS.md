# Fluxos de privacidade — Folio

## RLS

Tabelas pessoais: `profiles`, `user_preferences`, `accounts`, `credit_cards`, `categories`, `transactions`, `bills`, `subscriptions`, `budgets`, `financial_goals`, `attachments`, `receipt_scans`, `recurring_transactions`, `user_merchant_rules`, `user_consents`, `data_export_jobs`, `privacy_requests`.

Padrão: `USING (user_id = auth.uid())` e `WITH CHECK (user_id = auth.uid())`.

Catálogo global `merchant_brands`: SELECT autenticado, sem dado de usuário.

`security_incidents`: RLS on, sem policy para authenticated.

`audit_events`: SELECT próprio; INSERT só via `write_audit_event`.

## Storage

- `receipts` privado. Path: `{user_id}/pending/{uuid}.ext` depois `{user_id}/{transaction_id}/{uuid}.ext`.
- Policies: primeira pasta = `auth.uid()`.
- Acesso de leitura na aplicação: `createSignedUrl` com TTL curto. Path persistido, nunca a URL assinada.
- `privacy-exports` privado. Path: `{user_id}/{job_id}.zip`. TTL 24h.
- `brand-assets` público: apenas logos de marcas, não comprovantes.

## Exportação

```text
reautenticação (senha)
→ rate limit
→ job PROCESSING
→ ZIP (somente linhas do user_id)
→ upload privado
→ signed URL (15 min)
→ expira 24h / purge
```

## Exclusão da conta

```text
Configurações → Privacidade
→ senha + texto EXCLUIR MINHA CONTA
→ audit ACCOUNT_DELETION_REQUESTED
→ privacy_request DELETION
→ delete storage receipts + privacy-exports
→ DELETE auth.users
→ CASCADE nas tabelas pessoais
```

## OCR

```text
upload autenticado → validação MIME/tamanho → sharp (remove EXIF em imagens)
→ arquivo privado → OCR só com o buffer
→ extração → confirmação do usuário → transação
```
