# Mapa de dados pessoais — Folio

Classificação interna (não substitui a classificação jurídica da LGPD): PUBLIC, INTERNAL, PERSONAL, FINANCIAL, SENSITIVE_INTERNAL.

Retenção resumida: conta ativa = enquanto houver conta; exclusão = remoção na aplicação + rotação de backup do provedor.

## Conta e perfil

| Dado | Origem | Finalidade | Onde | Serviços | Acesso | Base legal a validar | Terceiros | Exclusão |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Nome | Cadastro / perfil | Identificar a conta na interface | `profiles` | App, Supabase | O próprio usuário | Execução de contrato / legítimo interesse (validar) | Supabase | Cascade ao excluir conta |
| E-mail | Cadastro | Autenticação e recuperação de senha | Supabase Auth | App, Supabase | O próprio usuário | Execução de contrato | Supabase | Exclusão do usuário Auth |
| Senha (hash) | Cadastro | Autenticar | Supabase Auth | Supabase Auth | Ninguém em claro | Execução de contrato | Supabase | Exclusão do usuário Auth |
| Avatar URL | Perfil (campo existe, upload não é fluxo atual) | Foto opcional | `profiles.avatar_url` | App, Supabase | O próprio usuário | Consentimento/contrato se usado | Supabase | Cascade |
| Fuso / moeda / tema | Preferências | Exibir valores e datas | `profiles`, `user_preferences` | App | O próprio usuário | Execução de contrato | Supabase | Cascade |
| Aceite de políticas | Cadastro | Registrar ciência das versões | `user_consents` | App | O próprio usuário | Registro de aceite | Supabase | Cascade |

## Dados financeiros

| Dado | Origem | Finalidade | Onde | Classificação | Terceiros | Exclusão |
| --- | --- | --- | --- | --- | --- | --- |
| Receitas e despesas | Lançamentos do usuário | Controle financeiro | `transactions` | FINANCIAL | Supabase | Histórico ou conta |
| Valores (centavos) | Lançamentos | Somar e orçar | tabelas financeiras | FINANCIAL | Supabase | Idem |
| Contas / carteiras | Cadastro | Saldos e origem do pagamento | `accounts` | FINANCIAL | Supabase | Conta |
| Cartões (apelido, bandeira, last_four, limite, dias) | Cadastro | Faturas e vencimento | `credit_cards` | FINANCIAL | Supabase | Conta |
| Categorias | Seed + usuário | Organizar gastos | `categories` | FINANCIAL | Supabase | Conta |
| Estabelecimentos | Texto informado / OCR confirmado | Identificar gasto e logo local | `transactions.merchant` | FINANCIAL | Não enviado a API de logo | Histórico ou conta |
| Assinaturas, metas, orçamentos, contas a pagar | Cadastro | Planejamento | tabelas respectivas | FINANCIAL | Supabase | Conta |
| Comprovantes / NF / imagens | Upload | Guardar prova do gasto | Storage `receipts` + `attachments` | FINANCIAL / SENSITIVE_INTERNAL | Supabase Storage | Excluir comprovantes ou conta |
| Extração OCR | Arquivo enviado | Sugerir campos para confirmação | `receipt_scans.extracted` + provedor OCR no momento da leitura | FINANCIAL | OpenAI (arquivo) | Scans / conta |

## Técnico

| Dado | Coletado hoje? | Onde | Observação |
| --- | --- | --- | --- |
| IP | Não pelo app | Pode existir em logs de Vercel/Supabase | Infraestrutura; não gravamos em tabela própria |
| User-Agent | Não pelo app | Possível em logs de infra | Idem |
| Cookies de sessão | Sim, necessários | Cookie httpOnly do Auth | Sem analytics |
| Logs técnicos | Sim, minimizados | Console/hospedagem | `sanitizeLog` remove segredos |
| Analytics de produto | Não | — | Eventos financeiros não são enviados a ferramentas de analytics |
| Export ZIP temporário | Sob demanda | Storage `privacy-exports` | Expira em 24h |

## Minimização

Não coletamos CPF, endereço, número completo de cartão, CVV, PIN ou senha bancária. Cartões usam apenas nickname, brand, last_four, closing_day, due_day e limit.
