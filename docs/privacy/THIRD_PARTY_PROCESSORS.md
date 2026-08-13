# Processadores / operadores — Folio

Não incluir fornecedor novo que receba dado pessoal sem avaliar impacto.

| Fornecedor | Finalidade | Dados transmitidos | Região | Retenção conhecida | Privacidade | DPA |
| --- | --- | --- | --- | --- | --- | --- |
| Supabase | Auth, Postgres, Storage | Conta, dados financeiros, arquivos | Projeto atual em `sa-east-1` | Conta + backups do plano | [supabase.com/privacy](https://supabase.com/privacy) | Verificar contrato da organização |
| Vercel | Hospedagem Next.js | Request HTTP, cookies de sessão, logs | Conforme projeto Vercel | Logs da plataforma | [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy) | Verificar contrato da organização |
| OpenAI | OCR/Vision de comprovante | Arquivo do comprovante + prompt de extração | Conforme conta OpenAI | Ver política da API; pedimos `store: false` | [openai.com/policies/privacy-policy](https://openai.com/policies/privacy-policy) | Preferir plano API que não treine com dados do cliente; **validar contratualmente** |
| Analytics | — | Não utilizado | — | — | — | Não aplicar |
| E-mail transacional próprio | Recuperação de senha | E-mail do titular | Via Supabase Auth | Fluxo de reset | Depende do Auth | Incluído no Supabase |

## OCR e treinamento

Decisão técnica atual: enviar só o arquivo, com `store: false`, sem user_id e sem extrato. A garantia de “não treinar com dados do cliente” depende do contrato/plano OpenAI vigente — isso é **decisão jurídica/contratual**, não um selo automático.

## Logos

Catálogo local (`merchant_brands` + arquivos em `/brands`). Não enviamos histórico, valor nem data a um serviço de logos.
