Quero que você atue como **Arquiteto de Software Sênior, Product Designer, UX/UI Designer e Desenvolvedor Full Stack** e crie um sistema web completo de **controle financeiro pessoal**.

O objetivo é criar uma aplicação extremamente agradável visualmente, simples de usar, rápida e preparada para crescer no futuro.

O sistema deverá rodar utilizando:

* **Vercel** para frontend e backend/serverless;
* **Supabase** para banco de dados, autenticação e armazenamento;
* arquitetura preparada para múltiplos usuários;
* foco inicial em uso pessoal, porém sem criar limitações arquiteturais que impeçam transformar o produto em SaaS futuramente.

---

# 1. STACK TECNOLÓGICA

Utilize preferencialmente:

### Frontend

* Next.js com App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide Icons
* React Hook Form
* Zod
* Recharts para gráficos
* componentes responsivos
* Server Components quando fizer sentido

### Backend

Utilizar principalmente:

* Next.js Route Handlers / Server Actions
* Supabase PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Row Level Security — RLS

Caso alguma operação pesada precise ser desacoplada, utilizar:

* Supabase Edge Functions

Evite criar um backend separado sem necessidade.

---

# 2. IDENTIDADE VISUAL

Utilize como principal referência visual:

https://www.abacatepay.com/

Não copie literalmente a interface.

Quero uma identidade inspirada nesse estilo:

* moderna;
* extremamente limpa;
* minimalista;
* jovem;
* premium;
* amigável;
* financeira sem parecer um banco tradicional;
* bastante espaço em branco;
* cores claras;
* verde como principal cor de destaque;
* elementos arredondados;
* tipografia grande e elegante;
* poucos elementos competindo pela atenção.

Utilize aproximadamente a seguinte direção de cores:

* fundo principal: branco / off-white;
* cards: branco;
* texto principal: verde extremamente escuro, quase preto;
* texto secundário: cinza;
* cor principal: verde-limão / verde abacate;
* verde suave para fundos secundários;
* vermelho suave para despesas/atrasos;
* amarelo suave para alertas;
* azul apenas quando necessário para informação.

Crie todas as cores como **Design Tokens / CSS Variables**, nunca espalhe valores hardcoded pelo sistema.

Exemplo:

--background
--foreground
--primary
--primary-foreground
--secondary
--muted
--border
--success
--warning
--danger
--card

A aplicação deve possuir uma identidade visual própria, inspirada na AbacatePay.

---

# 3. RESPONSIVIDADE

O sistema deve funcionar perfeitamente em:

* Desktop
* Notebook
* Tablet
* Smartphone

Priorize experiência **mobile-first**, principalmente porque o usuário poderá registrar gastos imediatamente após uma compra.

No celular, a experiência deve se aproximar de um aplicativo nativo.

Configure a aplicação para poder futuramente funcionar como **PWA**.

---

# 4. AUTENTICAÇÃO

Criar autenticação usando Supabase Auth.

Permitir:

* cadastro;
* login;
* logout;
* recuperação de senha;
* persistência da sessão.

Criar tabela:

profiles

Campos:

* id
* user_id
* name
* avatar_url
* currency
* timezone
* created_at
* updated_at

A moeda padrão deverá ser:

BRL — Real brasileiro.

---

# 5. DASHBOARD

A primeira página depois do login deverá ser o Dashboard.

Quero uma tela extremamente visual e simples.

Mostrar cards como:

### Saldo atual

Exemplo:

R$ 8.420,32

Mostrar abaixo:

+8,4% comparado ao mês passado.

---

### Entradas do mês

R$ 7.500,00

---

### Gastos do mês

R$ 4.280,32

---

### Contas futuras

R$ 1.890,20

---

Além disso, criar:

### Gráfico de entradas x saídas

Permitir selecionar:

* 7 dias
* 30 dias
* 3 meses
* 6 meses
* 1 ano

---

### Gastos por categoria

Exemplo:

Alimentação
R$ 820

Transporte
R$ 450

Moradia
R$ 1.500

Lazer
R$ 320

Assinaturas
R$ 190

Utilizar gráficos simples e elegantes.

---

# 6. TRANSAÇÕES

Criar uma área chamada:

**Transações**

Permitir registrar:

* receita;
* despesa;
* transferência.

Campos de uma transação:

* descrição
* valor
* data
* categoria
* conta
* forma de pagamento
* estabelecimento
* observações
* anexo
* recorrente ou não
* tags

Formas de pagamento:

* PIX
* Dinheiro
* Débito
* Crédito
* Boleto
* Transferência
* Outros

Permitir filtros por:

* período;
* categoria;
* valor;
* conta;
* cartão;
* estabelecimento;
* forma de pagamento;
* receita/despesa.

Criar busca textual.

---

# 7. REGISTRO RÁPIDO DE GASTO

Essa deve ser uma das funcionalidades mais importantes.

Adicionar botão global:

**+ Novo gasto**

Ele deverá estar facilmente acessível tanto no desktop quanto no mobile.

Ao clicar, abrir um modal/bottom sheet simples.

Exemplo:

Quanto você gastou?

R$ ______

Depois:

Onde?

Categoria

Forma de pagamento

Data

Descrição

O objetivo é conseguir registrar uma compra em poucos segundos.

---

# 8. ESCANEAMENTO DE COMPROVANTES

Criar uma funcionalidade chamada:

**Escanear comprovante**

No smartphone, permitir:

* abrir câmera;
* tirar foto;
* selecionar imagem da galeria;
* selecionar PDF.

Suportar:

* comprovantes PIX;
* notas fiscais;
* recibos;
* cupons fiscais;
* comprovantes de cartão;
* boletos pagos.

---

# 9. OCR / INTELIGÊNCIA DE COMPROVANTES

Depois do upload, enviar a imagem para um serviço de OCR/Vision.

Criar a arquitetura dessa funcionalidade de forma desacoplada.

Criar um serviço:

ReceiptProcessor

Ele deverá receber:

imagem/PDF

e retornar um JSON padronizado.

Exemplo:

{
"merchant": "Supermercado Verdemar",
"description": "Compra supermercado",
"amount": 186.42,
"date": "2026-08-13",
"payment_method": "credit_card",
"installments": 1,
"document_number": null,
"cnpj": "00.000.000/0000-00",
"suggested_category": "alimentacao",
"confidence": 0.94
}

IMPORTANTE:

Nunca registrar automaticamente uma transação sem confirmação.

Depois da leitura, mostrar:

**Encontramos estas informações:**

Supermercado Verdemar

R$ 186,42

13 de agosto

Cartão de crédito

Categoria sugerida:
Alimentação

[Confirmar gasto]

[Editar informações]

O usuário sempre deverá revisar os dados antes do cadastro definitivo.

---

# 10. FLUXO DO COMPROVANTE

Fluxo esperado:

Foto / Upload

↓

Compressão da imagem

↓

Remoção de metadados desnecessários

↓

Upload seguro para Supabase Storage

↓

OCR / Vision

↓

Extração dos dados

↓

Normalização

↓

Sugestão de categoria

↓

Tela de confirmação

↓

Usuário confirma

↓

Transação cadastrada

↓

Comprovante vinculado à transação.

---

# 11. ÍCONES PARA CADA GASTO/DÍVIDA

Essa é uma característica importante da aplicação.

Cada dívida, gasto ou conta deve possuir um **ícone visual próprio**.

Exemplos:

Netflix → ícone de televisão/play

Spotify → música

Uber → carro

Posto de gasolina → combustível

Supermercado → carrinho

Restaurante → garfo e faca

Academia → halter

Aluguel → casa

Energia → raio

Água → gota

Internet → Wi-Fi

Telefone → smartphone

Cartão → cartão de crédito

Viagem → avião

Farmácia → cruz/medicamento

Educação → livro

Investimento → gráfico

Shopping → sacola

Utilizar preferencialmente Lucide Icons.

Criar um sistema de:

merchant_icon_rules

para associar automaticamente determinados estabelecimentos a determinados ícones.

Exemplo:

Uber → Car

Netflix → Tv

Spotify → Music

Smart Fit → Dumbbell

O usuário também deve conseguir alterar manualmente o ícone.

Caso nenhum ícone seja encontrado, utilizar:

* ícone da categoria;
* ou iniciais do estabelecimento dentro de um círculo.

Cada gasto deve ficar visualmente fácil de identificar.

---

# 12. CATEGORIAS

Criar categorias iniciais:

* Alimentação
* Mercado
* Moradia
* Transporte
* Combustível
* Saúde
* Academia
* Lazer
* Assinaturas
* Educação
* Compras
* Viagens
* Investimentos
* Impostos
* Presentes
* Pets
* Trabalho
* Outros

Cada categoria deverá possuir:

* nome;
* ícone;
* cor;
* tipo;
* usuário dono ou categoria padrão.

Permitir criar categorias personalizadas.

---

# 13. CONTAS A PAGAR

Criar tela:

**Contas**

Mostrar contas futuras.

Exemplo:

Netflix
R$ 55,90
15 AGO

Energia
R$ 184,32
18 AGO

Academia
R$ 129,90
20 AGO

Cartão Nubank
R$ 2.430,82
25 AGO

Cada uma deverá possuir seu próprio ícone.

Status:

* Pendente
* Pago
* Atrasado
* Cancelado

Permitir marcar como:

**Pago**

Ao marcar como pago, perguntar se deseja criar automaticamente uma transação de despesa.

---

# 14. CONTAS RECORRENTES

Permitir criar recorrência.

Exemplo:

Netflix

R$ 55,90

Todo dia 15

Repetir:
Mensalmente

Outros tipos:

* semanal;
* mensal;
* trimestral;
* semestral;
* anual;
* personalizado.

O sistema deverá gerar/prever as próximas contas automaticamente.

---

# 15. ASSINATURAS

Criar uma área específica:

**Assinaturas**

Identificar gastos recorrentes.

Exemplo:

Netflix
R$ 55,90

Spotify
R$ 21,90

ChatGPT
R$ XX

iCloud
R$ XX

Mostrar:

**Total mensal com assinaturas**

R$ 327,80

Mostrar também:

R$ 3.933,60 / ano

Esse segundo número é muito importante para mostrar o impacto real das assinaturas.

---

# 16. CARTÕES DE CRÉDITO

Criar gerenciamento de cartões.

Campos:

* nome;
* bandeira;
* últimos 4 dígitos;
* limite;
* dia de fechamento;
* dia de vencimento;
* cor;
* ativo.

Nunca armazenar número completo do cartão.

Exemplo:

Nubank

**** 4821

Fatura atual:
R$ 2.430,82

Limite:
R$ 8.000

Disponível:
R$ 5.569,18

---

# 17. COMPRAS PARCELADAS

Permitir:

R$ 1.200

6x de R$ 200

O sistema deverá automaticamente gerar:

Parcela 1/6
Parcela 2/6
Parcela 3/6
...

Associadas à compra original.

Não duplicar incorretamente o valor total nos relatórios.

---

# 18. ORÇAMENTO MENSAL

Criar tela:

**Orçamento**

Permitir definir limites.

Exemplo:

Alimentação

R$ 620 / R$ 800

77%

Mostrar barra de progresso.

Estados:

Normal

Atenção

Limite próximo

Limite excedido

---

# 19. METAS

Criar metas financeiras.

Exemplo:

MacBook

Meta:
R$ 12.000

Guardado:
R$ 4.500

37,5%

Outra:

Viagem Japão

R$ 25.000

Permitir adicionar valores periodicamente.

---

# 20. CALENDÁRIO FINANCEIRO

Criar uma visualização por calendário.

Mostrar:

* contas;
* faturas;
* receitas;
* recorrências;
* parcelas.

Exemplo:

15
Netflix
R$ 55,90

20
Academia
R$ 129,90

25
Nubank
R$ 2.430

---

# 21. PREVISÃO FINANCEIRA

Criar área:

**Próximos 30 dias**

Calcular:

Saldo atual

*

Receitas previstas

*

Contas previstas

=

Saldo projetado

Exemplo:

Saldo atual:
R$ 5.200

Receitas:

* R$ 7.500

Despesas previstas:

* R$ 4.850

Saldo previsto:
R$ 7.850

---

# 22. INSIGHTS

Criar uma área de insights simples.

Exemplos:

"Você gastou 18% mais com restaurantes este mês."

"Suas assinaturas representam R$ 327,80 por mês."

"Você gastou R$ 684 com Uber nos últimos 30 dias."

"Seu gasto com alimentação caiu 12%."

"Você já comprometeu 68% da renda prevista deste mês."

Evitar mensagens julgadoras.

A linguagem deve ser amigável e informativa.

---

# 23. TELA PRINCIPAL MOBILE

Criar navegação inferior parecida com aplicativo:

Dashboard

Transações

botão central +

Contas

Perfil

O botão + deve receber bastante destaque usando verde.

Ao pressioná-lo:

Novo gasto

Nova receita

Escanear comprovante

Nova conta

Transferência

---

# 24. SIDEBAR DESKTOP

No desktop utilizar sidebar minimalista.

Itens:

Logo

Visão geral

Transações

Contas

Cartões

Assinaturas

Orçamento

Metas

Relatórios

Configurações

Na parte inferior:

Avatar

Nome

Configurações

Sair

---

# 25. MICROINTERAÇÕES

Utilizar animações discretas.

Exemplos:

* hover;
* card expandindo;
* loaders elegantes;
* skeleton loading;
* animação ao registrar gasto;
* progresso das metas;
* transições entre páginas;
* feedback visual após salvar.

Não exagerar nas animações.

---

# 26. BANCO DE DADOS

Modele adequadamente o banco no PostgreSQL.

Considere tabelas como:

profiles

accounts

credit_cards

categories

transactions

transaction_installments

bills

recurring_transactions

subscriptions

budgets

financial_goals

financial_goal_contributions

attachments

receipt_scans

merchant_icon_rules

user_preferences

Crie relacionamentos corretos com foreign keys.

Utilize UUIDs.

Para valores monetários, evitar float.

Utilizar NUMERIC/DECIMAL ou valores em centavos.

---

# 27. MULTI-TENANCY

Mesmo que inicialmente seja um app pessoal, crie a arquitetura pensando em múltiplos usuários.

Toda informação deverá estar associada ao usuário autenticado.

Nunca permitir:

User A

acessar:

dados do User B.

---

# 28. ROW LEVEL SECURITY

RLS é obrigatório.

Criar políticas do Supabase garantindo que:

auth.uid()

só consiga visualizar, inserir, editar e excluir registros pertencentes ao próprio usuário.

Aplicar RLS em todas as tabelas que contenham informações pessoais.

---

# 29. STORAGE

Criar bucket privado:

receipts

Estrutura sugerida:

receipts/{user_id}/{transaction_id}/{arquivo}

Nunca deixar comprovantes públicos.

Utilizar Signed URLs quando necessário.

Validar:

* MIME type;
* extensão;
* tamanho;
* usuário proprietário.

---

# 30. SEGURANÇA

Nunca expor:

SUPABASE_SERVICE_ROLE_KEY

tokens privados

API Keys

no frontend.

Utilizar apenas variáveis públicas realmente necessárias no client.

Executar operações privilegiadas exclusivamente no servidor.

Adicionar:

* validação Zod;
* validação de uploads;
* rate limit em endpoints sensíveis;
* proteção contra arquivos maliciosos;
* limite de tamanho de upload;
* tratamento adequado de erros;
* logs sem informações sensíveis.

---

# 31. PRIVACIDADE DOS COMPROVANTES

Comprovantes financeiros podem conter dados pessoais.

Portanto:

* não expor arquivos publicamente;
* não registrar imagens em logs;
* não registrar dados confidenciais em logs;
* remover metadados EXIF desnecessários;
* permitir ao usuário excluir comprovantes;
* ao excluir conta, criar fluxo apropriado de exclusão dos arquivos.

---

# 32. EXPERIÊNCIA DO OCR

Durante o processamento mostrar algo elegante como:

Analisando seu comprovante...

Identificando estabelecimento...

Encontrando valor...

Identificando pagamento...

Tudo pronto ✓

Utilizar loading/skeleton elegante.

---

# 33. ESTADOS VAZIOS

Evite páginas vazias sem orientação.

Exemplo:

Nenhuma transação ainda.

"Seu dinheiro ainda está misterioso por aqui."

[Registrar primeiro gasto]

Ou:

Nenhuma assinatura encontrada.

"Quando você cadastrar despesas recorrentes, elas aparecerão aqui."

---

# 34. FORMATAÇÃO BRASILEIRA

Todo o sistema deverá funcionar corretamente com:

R$ 1.250,50

Datas:

13/08/2026

Timezone configurável.

Idioma inicial:

Português do Brasil.

---

# 35. TEMA ESCURO

Estruture o Design System para suportar Dark Mode.

Mas a prioridade visual inicial deverá ser o tema claro inspirado na identidade da AbacatePay.

---

# 36. PERFORMANCE

Aplicar boas práticas de Next.js.

Evitar:

* requisições duplicadas;
* componentes gigantes;
* carregamento desnecessário;
* JavaScript excessivo;
* consultas SQL sem índices.

Utilizar índices principalmente em:

user_id

date

category_id

account_id

credit_card_id

status

---

# 37. ACESSIBILIDADE

Garantir:

* navegação por teclado;
* labels;
* aria attributes quando necessários;
* contraste adequado;
* foco visível;
* botões acessíveis;
* inputs corretamente identificados.

---

# 38. ORGANIZAÇÃO DO CÓDIGO

Não quero um projeto monolítico e desorganizado.

Separe responsabilidades.

Exemplo:

src/
app/
components/
features/
transactions/
dashboard/
receipts/
budgets/
cards/
goals/
lib/
services/
hooks/
types/
validations/
utils/

Organize cada funcionalidade em módulos.

Evite arquivos gigantes.

---

# 39. CAMADA DE SERVIÇOS

Criar serviços claros como:

transactionService

receiptService

budgetService

subscriptionService

analyticsService

accountService

Evite colocar lógica de negócio diretamente dentro dos componentes React.

---

# 40. TIPAGEM

O projeto deve utilizar TypeScript corretamente.

Não utilizar `any` sem justificativa.

Gerar os tipos do banco do Supabase.

Compartilhar os schemas Zod quando possível entre frontend e backend.

---

# 41. TRATAMENTO DE ERROS

Criar padrão consistente de resposta.

Exemplo:

{
"success": true,
"data": {}
}

ou

{
"success": false,
"error": {
"code": "TRANSACTION_NOT_FOUND",
"message": "Transação não encontrada."
}
}

Evitar apresentar erros técnicos diretamente ao usuário.

---

# 42. TESTES

Adicionar testes para fluxos críticos:

* autenticação;
* criação de despesa;
* edição de despesa;
* exclusão;
* RLS;
* upload de comprovante;
* criação de parcela;
* recorrência;
* orçamento.

Utilizar testes unitários e pelo menos alguns testes E2E dos principais fluxos.

---

# 43. PRIMEIROS DADOS

Criar seed de categorias padrão.

Exemplo:

Alimentação → Utensils

Mercado → ShoppingCart

Transporte → Car

Combustível → Fuel

Moradia → House

Academia → Dumbbell

Saúde → HeartPulse

Assinaturas → RefreshCw

Lazer → Gamepad2

Educação → GraduationCap

Viagem → Plane

Investimentos → TrendingUp

Compras → ShoppingBag

Pets → PawPrint

Impostos → Landmark

---

# 44. PÁGINA DE LOGIN

Quero uma página de login extremamente bonita.

No desktop:

lado esquerdo:

branding + mensagem.

Exemplo:

"Entenda para onde seu dinheiro está indo."

Texto complementar:

"Controle seus gastos, acompanhe suas metas e tome decisões melhores sem planilhas complicadas."

lado direito:

card de login.

No mobile:

layout simplificado.

---

# 45. LOGO

Crie temporariamente uma identidade própria para o sistema.

Não utilize o logo da AbacatePay.

Crie um ícone simples relacionado a:

* dinheiro;
* folha;
* crescimento;
* organização financeira.

O nome do sistema deverá ficar fácil de alterar posteriormente.

Criar uma variável/configuração:

APP_NAME

para não espalhar o nome hardcoded pela aplicação.

---

# 46. NÃO FAÇA

Não quero:

* interface genérica de dashboard administrativo;
* sidebar enorme;
* centenas de informações na primeira tela;
* cards com gradientes exagerados;
* glassmorphism exagerado;
* cores neon;
* excesso de gráficos;
* aparência de ERP;
* aparência de banco tradicional;
* tabelas gigantes sem necessidade;
* interface com aspecto de template gratuito.

Quero aparência de **startup financeira moderna**.

---

# 47. FLUXO PRINCIPAL

O fluxo principal deverá ser:

Login

↓

Dashboard

↓

Usuário compra alguma coisa

↓

Abre sistema no celular

↓

Pressiona +

↓

Tira foto do comprovante

↓

Sistema identifica:

R$ 48,90

Restaurante X

Alimentação

PIX

↓

Usuário confirma

↓

Gasto cadastrado

↓

Dashboard atualizado imediatamente.

O processo inteiro deverá parecer extremamente simples.

---

# 48. ARQUITETURA FUTURA

Embora não seja necessário implementar agora, deixe a arquitetura preparada para futuramente adicionar:

* Open Finance;
* importação bancária;
* OFX;
* CSV;
* sincronização bancária;
* integração com bancos;
* inteligência financeira;
* detecção automática de assinaturas;
* metas inteligentes;
* compartilhamento financeiro entre casal;
* contas familiares;
* notificações;
* aplicativo iOS/Android;
* exportação PDF;
* exportação Excel;
* integração com WhatsApp;
* integração com Telegram.

Não implemente funcionalidades futuras se isso prejudicar o MVP.

---

# 49. MVP

Priorize inicialmente:

1. Autenticação
2. Dashboard
3. Contas
4. Transações
5. Categorias
6. Cartões
7. Registro rápido de gasto
8. Foto de comprovante
9. OCR/Vision
10. Contas recorrentes
11. Assinaturas
12. Orçamento
13. Responsividade
14. Segurança/RLS

Depois implemente recursos secundários.

---

# 50. ENTREGA

Quero que você implemente o projeto, não apenas gere protótipos.

Primeiro:

1. analise os requisitos;
2. defina arquitetura;
3. defina estrutura de pastas;
4. modele o banco;
5. crie migrations;
6. configure RLS;
7. crie Design System;
8. crie layout;
9. implemente autenticação;
10. implemente funcionalidades por módulo;
11. teste os principais fluxos.

Crie também:

* README;
* `.env.example`;
* migrations do Supabase;
* documentação do banco;
* documentação das variáveis de ambiente;
* instruções para executar localmente;
* instruções para deploy na Vercel;
* instruções de configuração do Supabase.

Nunca coloque secrets dentro do código.

---

# 51. REGRA IMPORTANTE PARA IA/CODEX

Não tente implementar toda a aplicação em um único arquivo ou em uma única etapa gigante.

Antes de codificar:

* faça uma análise da arquitetura;
* apresente rapidamente a estrutura proposta;
* identifique dependências;
* crie o schema;
* depois comece a implementação.

Durante o desenvolvimento:

* não quebre funcionalidades existentes;
* não substitua implementações funcionando sem necessidade;
* não use mocks onde já for possível usar Supabase real;
* não simule autenticação;
* não simule banco;
* não deixe TODOs em funcionalidades críticas;
* mantenha código legível;
* mantenha TypeScript corretamente tipado;
* aplique princípios SOLID quando fizer sentido;
* evite overengineering.

O resultado final deve parecer um **produto financeiro moderno pronto para ser utilizado**, e não apenas um projeto acadêmico ou um template de dashboard.

