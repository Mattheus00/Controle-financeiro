# Checklist de segurança e privacidade — Folio

Marque apenas o que estiver implementado de fato.

## P0

- [x] RLS em tabelas privadas com `user_id = auth.uid()`
- [x] Autenticação via Supabase Auth (sessão, logout, reset por link)
- [x] Storage privado `receipts`
- [x] Service Role ausente do frontend / não usada para furar RLS
- [x] Secrets só em variáveis de ambiente (`.env.example` sem valores)
- [x] Validação backend (Zod) nas actions
- [x] Isolamento entre usuários no banco + teste de path
- [x] Logs sanitizados (`sanitizeLog`)
- [x] Exclusão de conta com confirmação e remoção de arquivos
- [x] Política de Privacidade (`/privacidade`) e inventário (`DATA_MAP.md`)

## P1

- [x] Exportação ZIP + signed URL + expiração
- [x] Centro de privacidade em Configurações
- [x] Política de retenção documentada
- [x] Registro de tratamento
- [x] Terceiros documentados
- [x] Fluxo de incidentes + tabela `security_incidents`
- [x] Rate limit (login, reset, signup, OCR, export, exclusão, solicitações)
- [x] Headers de segurança / CSP
- [x] Termos de Uso separados (`/termos`)
- [x] Consentimentos específicos no cadastro (políticas, não “aceito tudo”)

## P2 / parcial

- [ ] Painel interno operacional para `privacy_requests` (a tabela existe; UI admin não)
- [ ] RIPD preenchido por tratamento de alto risco (template pronto)
- [ ] Cron dedicado de retenção (hoje a limpeza de export roda no próprio fluxo)
- [ ] MFA habilitado para o usuário final (Auth permite; UI de enrollment não está no MVP)
- [ ] Auditoria de dependências contínua (`npm audit` no CI)
- [ ] Ambientes staging/produção formalmente separados

## Não fazer

- Não afirmar “100% conforme LGPD” ou “certificado ANPD”
- Não usar Service Role para contornar RLS
- Não enviar extrato financeiro para API de logos ou analytics
