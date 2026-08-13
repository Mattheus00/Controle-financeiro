# LGPD & Privacy Readiness Report — Folio

Data: 13 de agosto de 2026. Este relatório descreve **controles técnicos**. Não é parecer jurídico nem certificação.

## Implementado (controle técnico)

- Isolamento por RLS e Storage privado de comprovantes
- Auth Supabase (login, logout, reset por link, sem senha em claro)
- Minimização de cartão (sem PAN/CVV)
- Validação Zod nas actions; OCR recebe só o arquivo
- Logs sanitizados; erros de UI sem SQL/stack
- Headers CSP / Referrer / nosniff / HSTS / Permissions-Policy
- Centro de privacidade: exportar, excluir comprovantes, excluir histórico, excluir conta, solicitações
- ZIP de exportação com signed URL e expiração
- Exclusão real (Auth + CASCADE + arquivos)
- Rate limit em login, signup, reset, OCR, export e exclusão
- Documentação em `docs/privacy/`
- Páginas `/privacidade` e `/termos`
- Registro de aceite das políticas no cadastro (checkboxes desmarcados)

## Parcial

- MFA: arquitetura Auth permite; enrollment na UI não está no MVP
- Retenção automática de backups: depende do plano Supabase
- Painel admin de `privacy_requests` / `security_incidents`
- RIPD: template existe, não preenchido por advogado
- `npm audit` não está no CI
- Staging separado de produção: não formalizado neste repositório

## Pendente

- DPA assinado com cada operador
- Definição jurídica das bases legais (contrato vs. legítimo interesse vs. consentimento)
- Nome/contato do encarregado, se a estrutura exigir
- Avaliação contratual de não-treinamento do provedor de OCR
- Cron independente para expurgo (hoje acoplado ao fluxo de export)

## Requer decisão jurídica

- Enquadramento do controlador e do encarregado
- Bases legais de cada operação em `PROCESSING_RECORDS.md`
- Transferências internacionais (Supabase/Vercel/OpenAI)
- Comunicação de incidentes à ANPD/titulares
- Open Finance ou IA de perfil financeiro, se forem adotados no futuro

Não usar selos do tipo “100% conforme LGPD” ou “certificado pela ANPD”.
