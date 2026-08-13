# Política de retenção — Folio

| Conjunto | Critério | Observação |
| --- | --- | --- |
| Conta ativa | Enquanto a conta existir | Dados necessários para o serviço |
| Conta excluída | Remoção imediata na aplicação (linhas + storage) | `delete_own_account` apaga Auth, o que dispara CASCADE |
| Comprovantes | Enquanto existirem na conta, ou até “Excluir comprovantes” | Bucket privado `receipts` |
| Exportações | 24 horas após geração | `data_export_jobs.expires_at` + `purge_expired_exports` |
| Sessões | Política do Supabase Auth | Logout invalida a sessão atual |
| Consentimentos | Enquanto a conta existir | Tipos específicos; marketing não é usado hoje |
| Solicitações de privacidade | Enquanto a conta existir | `notes_internal` não é exposto ao titular |
| Auditoria mínima | Permanece com `user_id` nulo após exclusão (SET NULL) | Só tipo de evento, sem extrato financeiro |
| Logs técnicos | Prazo da Vercel/Supabase | Sem senha, token, comprovante completo |
| Incidentes de segurança | Registro interno, só service_role | `security_incidents` |
| Backups | Prazo do provedor (Supabase PITR/backups, se habilitado) | Backup não justifica retenção indefinida; após exclusão, some na rotação |

Não usamos `deleted_at` para guardar dado pessoal para sempre. Soft delete, se for introduzido, precisa de prazo de expurgo.
