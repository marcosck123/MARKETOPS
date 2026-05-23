# MVP 3 — Planejamento

## Visão geral

Expansão do MARKETOPS com retaguarda separada, 5 roles distintos, PDV redesenhado, sistema fiscal com NF-e (mock) e sistema de chamada ao supervisor.

---

## Roles

| Role | Foco | Acesso |
|---|---|---|
| `operator` | Operador de caixa | PDV · Caixas · Vendas (próprias) |
| `supervisor` | Supervisor de caixa | Fila NF · Chamados · Cadastro de clientes |
| `estoque` | Gerente de estoque | Estoque · Compras · Fornecedores · Produtos · Seções |
| `financeiro` | Financeiro/Contador | Financeiro · Relatórios · Pagamentos · Auditoria · Caixas (leitura) · Vendas (leitura) · Compras (leitura) |
| `admin` | Gerente geral | Tudo + Usuários + Configurações + Sistema |

### Detalhamento do role `financeiro`

**Pode fazer:**
- Fechamento de caixa — ver balancete por turno, conferir valor declarado vs calculado
- Controle de vendas — todas as vendas por período, filtrar por operador/caixa/pagamento, ticket médio, cancelamentos e descontos
- Conciliação — quanto entrou por dinheiro, PIX, débito, crédito, fiado vs conta bancária
- Contas a receber (fiado) — saldo devedor por cliente, registrar recebimento, histórico
- Compras (leitura) — NFs de entrada lançadas, custo de mercadorias, sem edição
- Relatórios — DRE simplificado, relatório por produto/categoria, comparativo de períodos, exportar CSV/PDF
- Auditoria financeira — log de operações com dinheiro (abertura/fechamento de caixa, descontos, cancelamentos)

**Não acessa:**
- Produtos, Seções, Estoque operacional → função do `estoque`
- PDV, Supervisor, Chamados → função operacional
- Usuários, Configurações, Deploy → função do `admin`

---

## Arquitetura de rotas

### Frente de loja (operator + supervisor + admin)
```
/           Dashboard do turno
/pdv        Ponto de venda
/caixas     Abrir/fechar sessão
/vendas     Vendas da sessão
```

### Supervisor (supervisor + admin)
```
/supervisor           Fila em tempo real (chamados + NF)
/supervisor/clientes  Cadastro de clientes PF/PJ
```

### Estoque (estoque + admin)
```
/admin/produtos
/admin/secoes-categorias
/admin/estoque
/admin/compras
/admin/fornecedores
```

### Financeiro (financeiro + admin)
```
/admin/financeiro        → fluxo de caixa, contas a receber
/admin/relatorios        → DRE, relatórios por período, exportação
/admin/pagamentos        → fiado, conciliação
/admin/auditoria         → log financeiro
/admin/caixas            → leitura — balancetes de turno
/admin/vendas            → leitura — todas as vendas
/admin/compras           → leitura — NFs de entrada
```

### Admin only
```
/admin/usuarios
/admin/clientes
/admin/seguranca
/admin/configuracoes
/admin/impressao
/admin/self-checkout
/admin/integracoes
/admin/testes
/admin/deploy
```

---

## PDV — redesign

### Mudanças visuais
- Remover customer select (vendas avulsas)
- Header: nome do caixa + operador logado + horário
- Produtos: cards compactos 3 colunas, mais densidade
- Total no topo do painel direito (destaque máximo)
- Botão Finalizar h-14, sempre visível
- Produto sem estoque: borda âmbar + badge "Estoque baixo" / cinza para zerado
- Feedback visual ao adicionar item

### Gate de sessão
Ao entrar em `/pdv`, operador seleciona qual caixa está operando (modal de seleção de sessão). Só entra no PDV com sessão ativa.

### Botão Chamar Supervisor
- Canto superior direito do header
- Após acionar: mostra "Aguardando... (48s)" com contagem regressiva
- Um chamado por caixa por vez

### Fluxo NF no PDV
1. Pagamento registrado normalmente
2. Antes de finalizar: atalho de teclado abre modal
3. Modal: inserir CPF ou CNPJ
4. Opções: "Apenas CPF no cupom" ou "Solicitar NF-e"
5. Se NF-e: finaliza venda + cria FiscalRequest + exibe "Aguardando NF..."
6. Quando supervisor emite: PDV mostra "NF emitida ✓"

---

## Tela do supervisor (`/supervisor`)

Tela sempre aberta, polling a cada 4 segundos.

### Chamados de ajuda
- Cards empilhados por caixa solicitante
- Barra de progresso com tempo restante (1 minuto)
- Bipe a cada 5s enquanto houver chamado ativo
- Botão "Atender" encerra o chamado antes do tempo
- Badge na aba: `(2) Supervisor`

### Fila de NF
- Tickets por venda que solicitaram NF-e
- Exibe: caixa, operador, CPF/CNPJ digitado, total da venda
- Ações: "Emitir NF" (abre modal de cadastro + emissão)

### Emissão de NF (mock)
1. Supervisor abre ticket
2. Verifica se cliente está cadastrado pelo CPF/CNPJ
3. Se não: cria cadastro na hora
4. Confirma e "emite" NF-e
5. Sistema gera chave de 44 dígitos + protocolo fictício + PDF DANFE mock
6. PDV do operador atualiza automaticamente

---

## Banco de dados — novos models

### Customer
```
id, type (cpf|cnpj), document (único), name, tradeName?,
email?, phone?, zipCode?, street?, number?, complement?,
district?, city?, state?, ie?, active, createdAt
```

### FiscalRequest
```
id, saleId, customerId?, document, status (pending|processing|completed|cancelled),
nfeNumber?, nfeKey? (44 dígitos mock), nfePdfUrl?,
operatorId, supervisorId?, createdAt, updatedAt
```

### HelpRequest
```
id, cashRegisterId, operatorId, status (active|attended|expired),
expiresAt (createdAt + 60s), attendedBy?, attendedAt?, createdAt
```

### User (atualização)
```
+ active Boolean @default(true)
+ role: operator | supervisor | estoque | financeiro | admin
```

### Product (atualização)
```
+ ncm String?   (código NCM para NF-e)
+ cfop String?  (padrão "5102")
+ cst String?   (padrão "400")
```

### CompanySettings (novo — dados do emitente)
```
id, razaoSocial, cnpj, ie, address, number, district,
city, state, zipCode, phone, nfeSerie (default "1"),
nfeSequence (auto-incremento)
```

---

## Sidebars por role

### Operator
Dashboard · PDV · Caixas · Vendas

### Supervisor
Fila (Chamados + NF) · Clientes

### Estoque
Produtos · Seções e Categorias · Estoque · Compras · Fornecedores

### Financeiro
Financeiro · Relatórios · Pagamentos · Auditoria · Caixas · Vendas · Compras

### Admin
Todos os itens acima + Usuários · Configurações · Segurança · Sistema

---

## Técnico

| Ponto | Solução |
|---|---|
| Tempo real supervisor | Polling 4s via server action |
| Som de alarme | Web Audio API (sem arquivo externo) |
| Expiração de chamados | Filtro `expiresAt > now()` nas queries |
| PDF DANFE mock | `@react-pdf/renderer` |
| NF-e real (futuro) | Focus NFe / NFe.io — só troca a função de emissão |
| Middleware por role | Mapa de rotas permitidas por role verificado no middleware |

---

## Fases de implementação

### Fase 1 — Fundação e Controle de Acesso
- [ ] Atualizar `UserRole` enum: adicionar `supervisor`, `estoque`, `financeiro`
- [ ] Campo `active` no model `User`
- [ ] Middleware: controle por role com mapa de rotas permitidas
- [ ] Retaguarda: mover rotas para `/admin/*`
- [ ] Sidebars distintas por role (5 variantes)
- [ ] Tela `/admin/usuarios` — listar, criar, editar, desativar usuários

### Fase 2 — PDV redesign
- [ ] CashSession model (sessão por operador + caixa)
- [ ] Gate de sessão ao entrar no `/pdv`
- [ ] Novo layout PDV (cards compactos, total em destaque, sem customer select)
- [ ] Conectar PDV ao banco (produtos e caixas reais)
- [ ] Botão "Chamar Supervisor" com contagem regressiva

### Fase 3 — Supervisor
- [ ] HelpRequest model + server actions (criar, atender, expirar)
- [ ] Tela `/supervisor` com polling 4s
- [ ] Alarme sonoro via Web Audio API
- [ ] Badge na aba do browser com contagem de chamados ativos

### Fase 4 — Fiscal
- [ ] Customer model + server actions
- [ ] Tela `/supervisor/clientes` — cadastro PF/PJ
- [ ] FiscalRequest model + server actions
- [ ] Fluxo NF no PDV (modal CPF/CNPJ → aguardando → confirmado)
- [ ] Fila de NF na tela do supervisor
- [ ] Emissão mock — chave 44 dígitos + protocolo fictício + DANFE PDF
- [ ] CompanySettings model + tela `/admin/configuracoes`
- [ ] Campos NCM/CFOP/CST opcionais no model `Product`

### Fase 5 — Financeiro e Estoque
- [ ] Telas de leitura para role `financeiro` (caixas, vendas, compras)
- [ ] Dashboard financeiro — DRE simplificado, ticket médio, conciliação
- [ ] Relatórios com exportação CSV/PDF
- [ ] Nota fiscal de entrada (`StockReceipt`) — draft → confirmar → gera StockEntry
- [ ] Tela de fornecedores
