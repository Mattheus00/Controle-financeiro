# Registro de operações de tratamento — Folio

Modelo interno orientativo (não substitui RIPD nem parecer jurídico).

| Processo | Finalidade | Dados | Titulares | Sistema | Compartilhamentos | Retenção | Controles | Base legal a validar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cadastro e login | Criar e autenticar conta | Nome, e-mail, senha (hash) | Usuário da conta | Next.js + Supabase Auth | Supabase | Conta ativa | Sessão, rate limit, HTTPS | Contrato |
| Controle financeiro | Registrar e consultar gastos | Transações, contas, cartões minimizados, metas | Usuário da conta | Postgres + RLS | Supabase | Conta ativa / exclusão de histórico | RLS `user_id = auth.uid()` | Contrato |
| Comprovantes | Arquivar e ler documento | Imagem/PDF, EXIF removido em raster | Usuário da conta | Storage privado | Supabase Storage | Até exclusão | MIME, tamanho, path UUID, signed URL | Contrato |
| OCR | Sugerir campos do comprovante | Somente o arquivo enviado | Usuário da conta | OpenAI Vision (servidor) | OpenAI | Processamento + `receipt_scans` até exclusão | Sem outros lançamentos no payload; confirmação humana | Contrato / legítimo interesse (validar) |
| Exportação | Atender acesso/portabilidade | Cópia dos dados do titular | Usuário da conta | ZIP em bucket privado | Link assinado temporário | 24h | Reautenticação, rate limit | Direito do titular |
| Exclusão | Encerrar tratamento | Todos os dados da conta | Usuário da conta | RPC `delete_own_account` | — | Imediato na app | Confirmação explícita + senha | Direito do titular |
| Logos de marca | Exibir ícone | Só o nome do estabelecimento | Usuário da conta | Catálogo interno | Nenhum envio de extrato | — | `resolveMerchantBrand({ merchantName })` | Contrato |

Open Finance, insights automatizados de perfil e painel admin não estão implementados e exigem revisão própria antes de existir.
