# UX Flow e Navigation Checklist

Este arquivo define o checklist obrigatório de fluxo, ações, botões, menus, CTAs, rotas e redirecionamentos.

## 1. Regra absoluta

Nenhuma interface deve ser criada sem fluxo definido.

Antes de sugerir layout, componente ou prompt para Codex, validar:

- o que o usuário quer fazer;
- onde ele começa;
- qual ação principal executa;
- para onde ele vai;
- o que o sistema responde;
- como ele volta;
- o que acontece se der erro.

## 2. Mapa obrigatório de ações

Sempre criar uma tabela com este formato:

| Elemento | Tipo | Ação | Destino/Comportamento | Status |
|---|---|---|---|---|
| Novo produto | Botão primário | Iniciar cadastro | Página, modal ou drawer | Precisa confirmar |
| Editar | Ação de item | Editar registro | Modal ou rota dinâmica | Precisa confirmar |
| Excluir | Ação perigosa | Remover registro | Modal de confirmação | Confirmado |
| Ver detalhes | Link/ação | Abrir detalhes | Drawer lateral | Sugerido |

Status possíveis:

- **Confirmado** — usuário já definiu.
- **Sugerido** — a equipe propôs, mas precisa validação se for decisão importante.
- **Precisa confirmar** — não implementar antes de o usuário responder.

## 3. Elementos que precisam de destino claro

Verificar sempre:

- botões primários;
- botões secundários;
- links;
- CTAs;
- cards clicáveis;
- linhas de tabela clicáveis;
- ícones de ação;
- menus laterais;
- menu superior;
- dropdowns;
- breadcrumbs;
- abas;
- filtros;
- busca;
- paginação;
- ações em massa;
- botões de salvar;
- botões de cancelar;
- botões de voltar;
- botões de excluir;
- botões de editar;
- botões de exportar;
- botões de imprimir;
- botões de compartilhar;
- botões de configurar;
- botões de login/logout.

## 4. Perguntas obrigatórias por tipo de ação

### 4.1 Botão de cadastro

Perguntar:

- Abre uma nova página?
- Abre modal?
- Abre drawer lateral?
- Usa rota dinâmica?
- Precisa manter contexto da tela atual?
- Tem permissão específica?

### 4.2 Botão de editar

Perguntar:

- Edita inline?
- Abre modal?
- Abre página de edição?
- Tem confirmação antes de salvar?
- Tem histórico de alteração?
- O usuário pode cancelar e voltar sem perder dados?

### 4.3 Botão de excluir

Regra obrigatória:

Sempre precisa de confirmação.

Perguntar:

- Exclusão é definitiva?
- Existe lixeira/soft delete?
- Precisa motivo da exclusão?
- Afeta outros registros?
- Quem tem permissão?

### 4.4 Botão de salvar

Perguntar:

- O que acontece após salvar?
- Fica na tela?
- Volta para lista?
- Abre detalhe?
- Mostra toast?
- Redireciona?
- O botão fica desabilitado durante envio?

### 4.5 Botão de cancelar

Perguntar:

- Volta para onde?
- Perde dados preenchidos?
- Precisa confirmação se houver alteração não salva?
- Apenas fecha modal?

### 4.6 Botão de exportar

Perguntar:

- Exporta CSV, XLSX ou PDF?
- Exporta todos os dados ou apenas filtrados?
- Precisa permissões?
- Precisa loading?
- Como tratar erro de exportação?

### 4.7 Botão de imprimir

Perguntar:

- Imprime a tela atual?
- Gera PDF?
- Usa layout próprio de impressão?
- Inclui cabeçalho/rodapé?
- Precisa pré-visualização?

### 4.8 Botão de finalizar

Perguntar:

- Finaliza o quê exatamente?
- Existe etapa de revisão?
- Precisa confirmação?
- Pode ser desfeito?
- Redireciona para resumo?
- Gera documento, recibo ou registro?

### 4.9 Botão de login/logout

Perguntar:

- Login leva para qual página?
- Logout limpa sessão?
- Logout redireciona para login?
- Existe tela de sessão expirada?
- Existe recuperação de senha?

## 5. Rotas e navegação

Sempre confirmar rotas antes de implementar.

Exemplo:

```txt
/produtos
/produtos/novo
/produtos/:id
/produtos/:id/editar
/configuracoes
/relatorios
```

Não inventar rotas se o projeto já tem padrão diferente.

## 6. Modal, drawer ou página?

Use este critério:

### Modal

Bom para:

- ações rápidas;
- confirmação;
- formulário pequeno;
- detalhe simples;
- tarefa que não precisa URL própria.

Evitar modal para:

- formulário longo;
- fluxo com várias etapas;
- conteúdo que precisa ser compartilhado;
- edição complexa.

### Drawer

Bom para:

- detalhes laterais;
- edição rápida;
- manter lista visível;
- contexto de tabela.

Evitar drawer para:

- fluxo crítico;
- formulário muito longo;
- mobile se ficar apertado.

### Página

Bom para:

- fluxo importante;
- cadastro longo;
- edição complexa;
- conteúdo com URL própria;
- navegação direta;
- permissões específicas.

Evitar página para:

- confirmação simples;
- ação de 1 clique;
- informação muito pequena.

## 7. Fluxo feliz e fluxos alternativos

Sempre mapear:

### Fluxo feliz

O usuário executa a tarefa sem erro.

### Fluxo alternativo

O usuário cancela, volta, edita, filtra, não encontra dados ou muda decisão.

### Fluxo de erro

API falha, validação falha, permissão falta, rede cai ou dado não existe.

## 8. Perguntas bloqueadoras

Pare e pergunte se faltar:

- destino de botão;
- ação de card clicável;
- rota principal;
- comportamento de salvar;
- comportamento de excluir;
- permissão de ação crítica;
- dados necessários para tela;
- tipo de formulário;
- estado pós-sucesso.

## 9. Perguntas não bloqueadoras

Pode sugerir e seguir se faltar:

- tom exato do texto;
- microcopy final;
- refinamento de espaçamento;
- nome de seção;
- ordem secundária de informações;
- ícone específico.

## 10. Regra final

Botão sem destino é dívida de UX.
Rota inventada é risco de implementação.
Fluxo incompleto gera tela bonita e sistema quebrado.
