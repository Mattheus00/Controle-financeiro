-- Teste manual/CI de isolamento. Executar com dois usuários conhecidos.
-- Não imprime dados financeiros, apenas contagens.

-- Exemplo de verificação (ajuste os UUIDs no runner):
-- SET ROLE authenticated;
-- SELECT set_config('request.jwt.claims', json_build_object('sub', :user_a, 'role', 'authenticated')::text, true);
-- SELECT count(*) FROM public.transactions WHERE user_id = :user_b; -- esperado: 0
