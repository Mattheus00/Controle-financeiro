# Resposta a incidentes — Folio

```text
detectar → conter → investigar → avaliar impacto → preservar evidências → corrigir → avaliar comunicação → registrar
```

## Papéis

Quem opera o Folio decide contenção e comunicação. Não inventar encarregado: usar `DATA_PROTECTION_CONTACT_NAME` / `DATA_PROTECTION_CONTACT_EMAIL` quando existirem.

## Passos

1. **Detectar** — logs, alerta do provedor, relato do usuário.
2. **Conter** — rotacionar chaves, revogar sessões, desativar integração, restringir Storage/Auth.
3. **Investigar** — o que vazou, desde quando, quais titulares. Não copiar extratos completos para tickets.
4. **Impacto** — volume, tipo de dado (financeiro vs. e-mail), probabilidade de acesso indevido.
5. **Evidências** — preservar logs relevantes com sanitização; registrar em `security_incidents` (somente administradores/service_role).
6. **Corrigir** — patch, RLS, rotação, revisão de políticas.
7. **Comunicação** — avaliar se a regulamentação exige aviso à ANPD e aos titulares. Isso é decisão jurídica.
8. **Registrar** — tipo, gravidade, sistemas, estimativa de afetados, resumo interno. Sem colar comprovantes.

Tabela `security_incidents`: RLS ligado, sem policy para `authenticated`. Acesso só com service_role/admin.
