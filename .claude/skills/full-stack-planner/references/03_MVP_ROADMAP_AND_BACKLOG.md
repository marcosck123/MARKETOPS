# MVP, Roadmap e Backlog

Este arquivo define como quebrar um projeto full stack em fases implementáveis.

## Regra central

Nunca entregue um plano como uma lista solta de ideias.

Todo projeto deve virar:

- MVP;
- fases;
- backlog;
- critérios de aceite;
- ordem de implementação;
- prompts para execução.

## Estrutura de fases

### Fase 0 — Levantamento e decisões

Objetivo:
Fechar decisões básicas antes de implementar.

Itens típicos:

- objetivo do sistema;
- público-alvo;
- perfis de usuário;
- módulos;
- stack;
- banco;
- fluxo principal;
- regras de permissão;
- integrações obrigatórias;
- riscos.

Saída:

- brief técnico;
- mapa de módulos;
- escopo do MVP;
- perguntas pendentes.

### Fase 1 — MVP funcional

Objetivo:
Criar o menor sistema utilizável.

Itens típicos:

- autenticação básica;
- layout base;
- CRUD principal;
- banco inicial;
- API principal;
- permissões básicas;
- deploy inicial;
- testes manuais.

Não incluir:

- automações avançadas;
- dashboards complexos;
- IA;
- relatórios sofisticados;
- multiempresa, salvo se for essencial;
- permissões granulares demais;
- microserviços.

### Fase 2 — Produto usável

Objetivo:
Melhorar produtividade e reduzir erros.

Itens típicos:

- filtros;
- busca;
- paginação;
- logs básicos;
- estados de erro;
- validações melhores;
- telas secundárias;
- exportações simples;
- melhorias de UX.

### Fase 3 — Produção segura

Objetivo:
Preparar para uso real.

Itens típicos:

- rate limiting;
- backups;
- logs estruturados;
- auditoria;
- política de permissões;
- ambientes dev/prod;
- monitoramento;
- tratamento de erros;
- revisão de secrets.

### Fase 4 — Escala e automação

Objetivo:
Melhorar performance e operação.

Itens típicos:

- cache, se necessário;
- filas, se necessário;
- workers;
- notificações;
- relatórios avançados;
- integrações;
- BI;
- automações.

### Fase futura — Recursos avançados

Objetivo:
Adicionar recursos que só fazem sentido após validação.

Itens possíveis:

- IA;
- app mobile;
- realtime;
- multiempresa complexo;
- marketplace;
- sistema de plugins;
- automação local;
- integrações bancárias;
- webhooks avançados.

## Modelo de backlog

Use este formato:

| ID | Tarefa | Fase | Prioridade | Dependência | Critério de aceite |
|---|---|---|---|---|---|
| FS-001 | Criar schema inicial | 1 | Alta | Escopo definido | Tabelas criadas e migration aplicada |
| FS-002 | Criar login | 1 | Alta | Auth escolhido | Usuário entra e sai com sessão persistente |
| FS-003 | Criar CRUD principal | 1 | Alta | Banco/API | Criar, listar, editar e arquivar registro |

## Critérios de aceite

Toda tarefa deve ter critério claro.

Critério ruim:

- Tela bonita.
- API funcionando.
- Login pronto.

Critério bom:

- Usuário admin consegue criar produto com nome, preço e estoque.
- Usuário operador consegue visualizar produtos, mas não excluir.
- Ao tentar salvar produto sem nome, aparece erro claro.
- Ao excluir, o sistema aplica soft delete e remove da lista padrão.

## Ordem de implementação recomendada

Para a maioria dos projetos full stack:

1. Definir entidades e permissões.
2. Criar banco/migrations.
3. Criar autenticação.
4. Criar backend/API principal.
5. Criar frontend base.
6. Integrar frontend com API.
7. Adicionar validações.
8. Adicionar estados de erro/loading/vazio.
9. Testar fluxos principais.
10. Preparar deploy.

## Anti-padrões

Evite:

- começar pela tela antes do fluxo;
- começar por design system completo;
- criar dashboard antes do CRUD principal;
- criar permissões complexas antes de perfis básicos;
- criar relatórios antes de ter dados consistentes;
- criar integração externa antes de simular fluxo local;
- criar automação antes de validar ação manual.

## Regra final

MVP não é sistema malfeito.

MVP é o menor sistema correto, seguro e testável.
