# Planejamento de Frontend, Telas e Integração

Este arquivo define como planejar a parte frontend sem se perder em visual.

## Regra central

Frontend deve representar fluxo real, não inventar comportamento.

Se um botão não tem destino, o planejamento deve parar e perguntar.

## Mapear telas

Para cada projeto, listar:

- tela de login;
- dashboard;
- listagem principal;
- detalhe;
- criação;
- edição;
- configurações;
- perfil;
- página pública;
- página administrativa;
- estados de erro.

Nem todas são necessárias no MVP.

## Modelo de tela

Para cada tela, definir:

```md
## Tela: Produtos

Objetivo:
Gerenciar cadastro de produtos.

Usuários:
Admin e operador.

Ação principal:
Cadastrar ou localizar produto.

Módulos:
- header
- busca
- filtros
- tabela
- drawer de criação/edição
- modal de confirmação de exclusão

Ações:
- Novo Produto: abre drawer
- Editar: abre drawer
- Excluir: abre modal de confirmação e aplica soft delete
- Ver Detalhes: abre drawer somente leitura

Estados:
- carregando lista
- lista vazia
- erro ao carregar
- salvando
- erro de validação
- sucesso ao salvar
```

## Componentes

Planejar componentes com responsabilidade clara.

Exemplos:

- PageHeader
- DataTable
- SearchInput
- FilterBar
- StatusBadge
- ConfirmDialog
- FormDrawer
- EmptyState
- LoadingState
- ErrorState

Não criar componentes genéricos demais cedo.

## Estado da interface

Sempre considerar:

- loading inicial;
- loading em ação;
- erro de API;
- lista vazia;
- busca sem resultado;
- sem permissão;
- formulário inválido;
- sucesso;
- confirmação.

## Integração com API

Para cada tela, definir:

- dados que busca;
- endpoint/action usada;
- quando busca;
- quando atualiza;
- tratamento de erro;
- invalidação/refetch;
- paginação;
- filtros;
- busca;
- optimistic update, se fizer sentido.

## Formulários

Para cada formulário:

- campos;
- validação;
- mensagens de erro;
- botão primário;
- botão cancelar;
- estado salvando;
- comportamento após sucesso;
- comportamento após erro.

## Responsividade

Planejar desktop e mobile.

Para dashboards/sistemas:

- sidebar vira menu;
- tabela vira lista ou cards;
- ações secundárias vão para menu;
- filtros podem virar drawer;
- formulários devem caber em mobile.

## UX mínima obrigatória

Toda tela precisa:

- título claro;
- ação principal visível;
- feedback de ação;
- erro compreensível;
- empty state útil;
- labels claros;
- botões com verbo;
- confirmação para ação destrutiva.

## O que evitar

Evitar:

- tela bonita sem API planejada;
- botão sem função;
- dados mockados como se fossem reais;
- tabela gigante sem paginação;
- modal aninhado;
- formulário longo em modal pequeno;
- estado de erro genérico demais;
- UX que depende de o usuário adivinhar.

## Handoff para Design Agent

Quando o planejamento exigir análise visual profunda, encaminhar para agente de Design UX/UI.

Handoff ideal:

```md
Tela: Produtos
Objetivo: gerenciar produtos
Usuários: admin e operador
Ações confirmadas:
- Novo Produto: drawer
- Editar: drawer
- Excluir: modal de confirmação + soft delete
- Ver Detalhes: drawer somente leitura
Dados: nome, código, categoria, preço, estoque, status
Permissões: admin edita/exclui; operador visualiza
Estados: loading, vazio, erro, salvando, sucesso, sem permissão
Estilo: minimalista, sistema administrativo, sem excesso visual
```

## Critério de frontend pronto

Frontend está pronto quando:

- tela representa fluxo real;
- ações têm destino;
- estados existem;
- API está integrada;
- permissões aparecem na UI e são validadas no backend;
- usuário entende o que fazer;
- mobile não quebra o fluxo principal.
