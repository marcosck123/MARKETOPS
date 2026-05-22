# Planejamento do Projeto MARKETOPS

## 1. Visao do Produto

O MARKETOPS sera um sistema empresarial para atacados, mercados medios e distribuidoras menores, com foco em gestao operacional, estoque, vendas, caixas, PDV, financeiro e, em uma fase futura, self-checkout.

O produto deve transmitir confianca, agilidade, organizacao, controle financeiro, seguranca e tecnologia. A prioridade inicial e construir uma base solida antes de avancar para o PDV.

## 2. Objetivo do MVP

Criar uma primeira versao funcional com base administrativa, autenticacao, cadastro de produtos, controle inicial de estoque e estrutura preparada para vendas e caixa.

O MVP nao deve tentar entregar tudo de uma vez. A primeira meta e sair de uma tela bonita para um sistema com dados organizados, regras claras e caminho seguro para evoluir.

## 3. Stack Recomendada

- Frontend: Next.js com App Router, TypeScript e Tailwind CSS.
- UI: shadcn/ui com componentes reutilizaveis.
- Formularios e validacao: React Hook Form e Zod.
- Banco de dados: PostgreSQL via Supabase ou Neon.
- Backend inicial: Next.js API Routes ou Server Actions.
- ORM: Prisma ou Drizzle.
- Autenticacao: Supabase Auth.
- Deploy: Vercel para frontend; Supabase/Neon para banco.

## 4. Identidade Visual

- Nome: MARKETOPS.
- Slogan: Controle total da operacao ao caixa.
- Fonte: Inter.
- Cor primaria: Verde esmeralda `#10B981`.
- Cor secundaria: Azul escuro `#0F172A`.
- Fundo claro: `#F8FAFC`.
- Texto principal: `#1E293B`.

Direcao visual:

- Interface empresarial, limpa e objetiva.
- Sidebar escura no painel administrativo.
- Cards de metricas bem legiveis.
- Tabelas claras para consulta e operacao.
- Status coloridos para facilitar leitura.
- PDV sem sidebar, focado em velocidade de atendimento.

## 5. Modulos do Sistema

### Modulos do MVP

- Login e permissoes.
- Dashboard administrativo.
- Empresa e lojas.
- Secoes e categorias.
- Produtos.
- Estoque basico com movimentacoes.
- Fornecedores.
- Caixas basicos.
- Auditoria inicial.

### Modulos posteriores

- Compras.
- Clientes.
- Motor de venda.
- PDV.
- Pagamentos.
- Relatorios.
- Financeiro.
- Impressao de comprovantes.
- Self-checkout.
- Integracoes fiscais, TEF, PIX automatico, balanca e impressora termica.

## 6. Ordem Recomendada de Desenvolvimento

1. Setup do projeto.
2. Design system base.
3. Autenticacao e permissoes.
4. Modelo inicial do banco.
5. Empresa e loja.
6. Secoes e categorias.
7. Produtos.
8. Estoque.
9. Fornecedores.
10. Compras.
11. Clientes.
12. Caixas.
13. Motor de venda.
14. PDV.
15. Pagamentos.
16. Dashboard com dados reais.
17. Relatorios.
18. Financeiro.
19. Auditoria e logs.
20. Seguranca.
21. Self-checkout.
22. Impressao.
23. Integracoes.
24. Testes.
25. Deploy.

## 7. Fases do Projeto

### Fase 0 - Escopo e Decisoes

Objetivo: fechar as decisoes fundamentais antes do desenvolvimento.

Entregaveis:

- Definicao se o sistema sera SaaS ou operacao unica.
- Lista dos modulos obrigatorios.
- Lista dos modulos futuros.
- Regras principais de negocio.
- Stack final escolhida.
- Roadmap do MVP.

Decisao critica: nao iniciar pelo PDV completo. O PDV depende de produtos, estoque, caixa, venda e pagamento.

### Fase 1 - Setup Tecnico

Objetivo: criar a base do projeto.

Tarefas:

- Criar projeto Next.js.
- Configurar TypeScript.
- Configurar Tailwind CSS.
- Instalar e configurar shadcn/ui.
- Configurar ESLint.
- Criar estrutura de pastas.
- Preparar variaveis de ambiente.
- Preparar conexao futura com Supabase.

Entregaveis:

- Projeto rodando localmente.
- Layout inicial funcionando.
- Estrutura organizada.
- Tema MARKETOPS configurado.

### Fase 2 - Design System e Layout Administrativo

Objetivo: criar a base visual reutilizavel.

Componentes iniciais:

- `AppSidebar`.
- `AppHeader`.
- `MetricCard`.
- `StatusBadge`.
- `DataTable`.
- `PageHeader`.
- `SearchInput`.
- `ConfirmDialog`.
- `EmptyState`.
- `LoadingState`.

Entregaveis:

- Sidebar escura.
- Header com busca, usuario e data.
- Dashboard inicial mockado.
- Componentes reutilizaveis.
- Padrao visual consistente.

### Fase 3 - Autenticacao e Permissoes

Objetivo: proteger o sistema e separar acessos por cargo.

Cargos iniciais:

- `ADMIN`.
- `GERENTE`.
- `CAIXA`.
- `ESTOQUE`.
- `FINANCEIRO`.
- `SUPORTE`.

Entregaveis:

- Login.
- Logout.
- Recuperacao de senha.
- Rotas protegidas.
- Usuario vinculado a empresa.
- Redirecionamento por permissao.

### Fase 4 - Banco de Dados Inicial

Objetivo: modelar a base para operacao real.

Tabelas iniciais:

- `companies`.
- `stores`.
- `users`.
- `roles`.
- `sections`.
- `categories`.
- `products`.
- `product_prices`.
- `stock_movements`.
- `cash_registers`.
- `cash_sessions`.
- `sales`.
- `sale_items`.
- `payments`.
- `audit_logs`.

Regras importantes:

- Toda tabela principal deve possuir `company_id`.
- Estoque deve ser alterado por movimentacao, nunca por edicao direta sem historico.
- Venda so deve baixar estoque quando for finalizada com pagamento aprovado.
- Acoes criticas devem gerar log.

### Fase 5 - Cadastros Operacionais

Objetivo: criar a base administrativa antes das vendas.

Modulos:

- Empresa e lojas.
- Secoes.
- Categorias.
- Produtos.
- Fornecedores.
- Clientes.

Entregaveis:

- CRUDs completos.
- Validacao com Zod.
- Busca e filtros.
- Status ativo/inativo.
- Relacionamentos principais.

### Fase 6 - Estoque

Objetivo: controlar entradas, saidas, ajustes e historico.

Funcionalidades:

- Visualizar estoque atual.
- Registrar entrada.
- Registrar ajuste.
- Registrar perda.
- Registrar devolucao.
- Exibir produtos com estoque baixo.
- Consultar historico de movimentacoes.

Entregaveis:

- Tela de estoque.
- Historico de movimentacoes.
- Alertas de estoque baixo.
- Logs de alteracoes.

### Fase 7 - Caixas

Objetivo: preparar a operacao de caixa antes do PDV.

Funcionalidades:

- Criar caixa fisico.
- Abrir sessao de caixa.
- Fechar sessao de caixa.
- Registrar valor inicial.
- Registrar sangria.
- Registrar suprimento.
- Conferir diferenca no fechamento.

Entregaveis:

- Tela de caixas.
- Abertura e fechamento de sessao.
- Relatorio basico por caixa.

### Fase 8 - Motor de Venda

Objetivo: criar a regra central de venda independente da interface.

Fluxo:

1. Criar venda aberta.
2. Adicionar produto.
3. Validar estoque.
4. Buscar preco atual.
5. Calcular subtotal.
6. Aplicar desconto.
7. Registrar pagamento.
8. Finalizar venda.
9. Baixar estoque.
10. Gerar log.

Entregaveis:

- `SaleService`.
- `SaleItemService`.
- `PaymentService`.
- `StockService`.
- `CashService`.
- `AuditService`.

### Fase 9 - PDV

Objetivo: criar a tela de venda para operador.

Elementos:

- Campo grande para codigo de barras.
- Lista de itens.
- Total em destaque.
- Botoes de pagamento.
- Cancelamento de venda.
- Remocao de item.
- Aplicacao de desconto.
- Finalizacao da venda.

Atalhos sugeridos:

- `F2`: buscar produto.
- `F4`: aplicar desconto.
- `F8`: finalizar venda.
- `ESC`: cancelar acao.
- `DEL`: remover item selecionado.

Entregaveis:

- Tela de PDV.
- Integracao com produtos reais.
- Pagamento simulado.
- Baixa de estoque.
- Venda finalizada.

### Fase 10 - Relatorios e Financeiro

Objetivo: dar visao gerencial ao dono ou gerente.

Relatorios iniciais:

- Vendas por periodo.
- Vendas por caixa.
- Vendas por operador.
- Produtos mais vendidos.
- Estoque baixo.
- Faturamento diario.
- Ticket medio.
- Pagamentos por metodo.

Financeiro inicial:

- Contas a pagar.
- Contas a receber.
- Fluxo de caixa.
- Lancamentos manuais.
- Categorias financeiras.

### Fase 11 - Self-checkout

Objetivo: criar caixa automatico depois do PDV estar estavel.

Pre-condicoes:

- Produtos funcionando.
- Estoque funcionando.
- Caixa funcionando.
- Motor de venda funcionando.
- Pagamentos funcionando.
- Logs funcionando.

Entregaveis:

- Interface simples para cliente.
- Carrinho.
- Pagamento simulado.
- Finalizacao da venda.
- Modo assistido por funcionario.

## 8. Roadmap de MVP

### MVP 1 - Base administrativa

- Projeto Next.js configurado.
- Layout admin.
- Dashboard mockado.
- Componentes visuais.
- Secoes e categorias.
- Produtos.
- Estoque basico.
- Caixas basicos.

### MVP 2 - Dados reais

- Banco real.
- Autenticacao.
- Produtos reais.
- Estoque com movimentacao.
- Dashboard com dados do banco.
- Logs basicos.

### MVP 3 - Motor de venda

- Criar venda.
- Adicionar item.
- Calcular total.
- Pagamento simulado.
- Finalizar venda.
- Baixar estoque.

### MVP 4 - PDV

- Tela de PDV.
- Leitura por codigo de barras.
- Pagamento.
- Comprovante simples.
- Fechamento de venda.

### MVP 5 - Relatorios e financeiro

- Relatorios de venda.
- Relatorios de estoque.
- Contas a pagar.
- Contas a receber.
- Fluxo de caixa.

### MVP 6 - Self-checkout

- Caixa automatico.
- Interface para cliente.
- Pagamento simulado.
- Modo assistido.
- Base para antifraude.

## 9. Riscos Principais

- Comecar pelo PDV antes da base.
- Banco mal modelado.
- Estoque inconsistente.
- Venda duplicada.
- Baixa de estoque errada.
- Permissoes fracas.
- Falta de auditoria.
- Sistema virar apenas mock visual.
- Tentar incluir integracoes fiscais cedo demais.
- Criar self-checkout antes do PDV.

## 10. Como Reduzir Riscos

- Construir em fases pequenas.
- Separar motor de venda da interface.
- Registrar logs desde cedo.
- Validar regras no backend.
- Usar movimentacoes para estoque.
- Criar testes para venda, estoque e permissoes.
- Manter o MVP enxuto.
- Validar o fluxo com uma operacao real de mercado ou atacado.

## 11. Proximo Passo Pratico

O proximo passo recomendado e iniciar o MVP 1.

Checklist imediato:

1. Criar o projeto Next.js.
2. Configurar Tailwind CSS.
3. Configurar shadcn/ui.
4. Criar layout administrativo.
5. Criar sidebar.
6. Criar header.
7. Criar dashboard mockado.
8. Criar tema MARKETOPS.
9. Criar estrutura de pastas.
10. Preparar conexao futura com Supabase.

Nao fazer agora:

- PDV completo.
- Maquininha/TEF.
- Nota fiscal.
- Self-checkout.
- Estoque complexo antes de produtos.
- Financeiro antes de vendas.

## 12. Criterio de Sucesso do MVP 1

O MVP 1 sera considerado pronto quando:

- O projeto rodar localmente sem erros.
- O painel administrativo estiver navegavel.
- O dashboard apresentar metricas mockadas.
- A identidade visual MARKETOPS estiver aplicada.
- A estrutura de pastas estiver preparada para crescer.
- Secoes, categorias, produtos, estoque e caixas tiverem telas iniciais.
- O projeto estiver pronto para receber autenticacao e banco real no MVP 2.
