-- Teste manual/CI de isolamento. Executar com dois usuários conhecidos.
-- Não imprime dados financeiros, apenas contagens.

-- Exemplo de verificação (ajuste os UUIDs no runner):
-- SET ROLE authenticated;
-- SELECT set_config('request.jwt.claims', json_build_object('sub', :user_a, 'role', 'authenticated')::text, true);
-- SELECT count(*) FROM public.transactions WHERE user_id = :user_b; -- esperado: 0

-- Painel administrativo (ajuste :admin_user, :regular_user e :request_id no runner):
-- 1. Usuário comum não enxerga papéis de terceiros nem executa RPCs administrativas.
-- SELECT set_config('request.jwt.claims', json_build_object('sub', :regular_user, 'role', 'authenticated')::text, true);
-- SELECT count(*) FROM public.user_roles WHERE user_id = :admin_user; -- esperado: 0
-- SELECT public.admin_dashboard_metrics(); -- esperado: permission denied / 42501

-- 2. O próprio admin enxerga apenas seu papel e consegue ler a fila pelo DTO.
-- SELECT set_config('request.jwt.claims', json_build_object('sub', :admin_user, 'role', 'authenticated')::text, true);
-- SELECT role FROM public.user_roles WHERE user_id = :admin_user; -- esperado: admin
-- SELECT request_id, customer_name, request_status FROM public.admin_list_privacy_requests(NULL);

-- 3. O cliente continua restrito às próprias solicitações e não recebe colunas administrativas.
-- SELECT set_config('request.jwt.claims', json_build_object('sub', :regular_user, 'role', 'authenticated')::text, true);
-- SELECT count(*) FROM public.privacy_requests WHERE user_id <> :regular_user; -- esperado: 0
-- SELECT admin_response FROM public.privacy_requests WHERE id = :request_id; -- esperado: permission denied
