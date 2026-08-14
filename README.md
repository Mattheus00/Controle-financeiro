# Folio

Controle financeiro pessoal: rápido no celular, calmo no desktop. Next.js + Supabase + Vercel.

## Stack

- Next.js App Router, TypeScript, Tailwind, shadcn/ui
- Supabase (Postgres, Auth, Storage, RLS)
- Vercel para deploy
- OCR de comprovantes via Groq (Qwen 3.6, visão no servidor)

## Começar

```bash
npm install
copy .env.example .env.local
```

Preencha as variáveis do Supabase em `.env.local`. Depois:

```bash
npx supabase start
npx supabase db reset
npm run dev
```

Se preferir um projeto remoto, rode as migrations no SQL Editor ou:

```bash
npx supabase db push
```

Abra [http://localhost:3000](http://localhost:3000), crie uma conta e registre o primeiro gasto.

## Variáveis de ambiente

Veja `.env.example`.

| Variável | Onde | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client e server | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client e server | Chave publicável / anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas servidor | Operações privilegiadas, se necessário |
| `GROQ_API_KEY` | Apenas servidor | Leitura de comprovantes (Groq) |
| `NEXT_PUBLIC_APP_URL` | Server | Redirects de auth |

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` com prefixo `NEXT_PUBLIC_`.

## Painel administrativo

O painel fica em `/admin` e usa a mesma autenticação do aplicativo. O acesso é liberado somente para
contas presentes em `public.user_roles`; não existe administrador fixo no código ou na migration.

Para cadastrar o primeiro administrador, localize o UUID da conta em **Authentication > Users** no
Supabase e execute no SQL Editor:

```sql
insert into public.user_roles (user_id, role)
values ('UUID_DA_CONTA', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

Para remover o acesso:

```sql
delete from public.user_roles where user_id = 'UUID_DA_CONTA';
```

O contador “Online agora” usa um canal privado do Supabase Presence. Em **Realtime Settings**, mantenha
a autorização de canais privados habilitada. Respostas de solicitações usam `RESEND_API_KEY` e
`RESEND_FROM_EMAIL`; se o envio falhar, a solicitação permanece em atendimento para nova tentativa.

## Supabase

1. Crie um projeto (região `sa-east-1` se estiver no Brasil).
2. Authentication → URL Configuration: `http://localhost:3000` e a URL da Vercel.
3. Redirect URLs: `http://localhost:3000/auth/callback` e `https://SEU_DOMINIO/auth/callback`.
4. Aplique `supabase/migrations/20260813182428_initial_schema.sql`.
5. Confirme o bucket `receipts` (privado) e as policies de Storage.
6. Opcional: `npm run types:generate` com o stack local ligado.

Detalhes do schema: [docs/database.md](docs/database.md).

## Deploy na Vercel

1. Suba o repositório e importe na Vercel.
2. Defina as mesmas variáveis de `.env.example` (sem secrets no código).
3. `NEXT_PUBLIC_APP_URL` deve ser a URL de produção.
4. No Supabase, acrescente a URL da Vercel nas redirect URLs.
5. Deploy. O app usa Route Handlers e Server Actions, sem backend separado.

## Testes

```bash
npm test
```

Cobrem formatação BRL, parcelas, orçamento, ícones, OCR normalizado e validação de transação. O RLS está nas migrations; valide com dois usuários depois de aplicar o schema.

## OCR

O fluxo nunca cadastra gasto sozinho. Upload → compressão/remoção de EXIF → Storage privado → `ReceiptProcessor` → tela de confirmação → transação.

Sem `GROQ_API_KEY`, o comprovante ainda é salvo e o usuário preenche os dados na mão.
