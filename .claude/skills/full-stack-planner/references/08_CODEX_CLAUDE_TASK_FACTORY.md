# Factory de Prompts para Codex e Claude Code

Este arquivo define como transformar planejamento em tarefas de implementação para agentes de código.

## Regra central

Codex e Claude Code precisam de tarefa pequena, contexto claro e limite de alteração.

Prompt genérico gera bagunça.
Prompt específico reduz erro.

## Estrutura obrigatória do prompt

Todo prompt para implementação deve conter:

1. Contexto do projeto
2. Objetivo da tarefa
3. Escopo exato
4. Arquivos prováveis
5. O que pode alterar
6. O que não pode alterar
7. Regras técnicas
8. Segurança
9. Critérios de aceite
10. Como testar
11. Entrega esperada

## Template base

```md
# Tarefa para Codex/Claude Code

## Contexto
Você está trabalhando no projeto [NOME].
Stack: [STACK].
Objetivo geral: [OBJETIVO].

## Objetivo da tarefa
Implementar [TAREFA ESPECÍFICA].

## Escopo
Faça apenas:
- [item 1]
- [item 2]
- [item 3]

Não faça:
- não refatore o projeto inteiro;
- não altere autenticação sem necessidade;
- não crie dependências novas sem justificar;
- não mude layout global sem pedido;
- não invente rotas ou módulos.

## Arquivos prováveis
Verifique primeiro:
- [arquivo/pasta]
- [arquivo/pasta]
- [arquivo/pasta]

## Regras técnicas
- seguir padrão existente do projeto;
- TypeScript sem `any` desnecessário;
- tratar loading, erro e vazio;
- validar entrada;
- manter componentes simples;
- preservar comportamento existente.

## Segurança
- não expor secrets no frontend;
- validar permissões;
- não confiar apenas na UI;
- não registrar dados sensíveis em logs.

## Critérios de aceite
- [critério objetivo 1]
- [critério objetivo 2]
- [critério objetivo 3]

## Como testar
Execute ou sugira:
- [comando]
- [passos manuais]

## Entrega esperada
Ao final, informe:
- arquivos alterados;
- resumo das mudanças;
- como testar;
- riscos ou pendências.
```

## Prompt para análise inicial do projeto

```md
Analise este projeto antes de alterar qualquer coisa.

Objetivo:
Entender a estrutura atual, stack, padrões, módulos existentes, fluxo de autenticação, banco/API e pontos de risco.

Não edite arquivos ainda.

Entregue:
1. stack detectada;
2. estrutura de pastas;
3. módulos existentes;
4. padrões de código;
5. riscos encontrados;
6. onde implementar a próxima tarefa;
7. perguntas bloqueadoras antes de editar.
```

## Prompt para criar MVP

```md
Implemente o MVP da feature [NOME] de forma incremental.

Antes de editar:
- leia a estrutura atual;
- identifique padrões existentes;
- confirme arquivos prováveis;
- proponha menor mudança segura.

Escopo do MVP:
- [item 1]
- [item 2]
- [item 3]

Fora do escopo:
- [item futuro]
- [item futuro]

Critérios de aceite:
- [critério 1]
- [critério 2]

Não crie arquitetura grande.
Não instale dependência nova sem necessidade.
Não invente regra de negócio.
```

## Prompt para backend/API

```md
Crie/ajuste a camada backend para [MÓDULO].

Requisitos:
- endpoints/actions: [listar]
- validação: [schema]
- permissões: [roles]
- erros esperados: 400, 401, 403, 404, 409
- logs: sem dados sensíveis

Banco:
- entidades envolvidas: [listar]
- relacionamento: [listar]
- soft delete: sim/não

Critérios de aceite:
- [critério]

Não exponha secrets.
Não coloque regra sensível só no frontend.
```

## Prompt para frontend

```md
Implemente a tela [NOME] seguindo o fluxo já definido.

Ações confirmadas:
- [botão]: [comportamento]
- [botão]: [comportamento]

Módulos:
- [módulo]
- [módulo]

Estados obrigatórios:
- loading
- vazio
- erro
- sucesso
- sem permissão, se aplicável

Estilo:
- minimalista
- limpo
- profissional
- sem animações exageradas

Não invente rotas.
Não crie botões sem ação.
Não use dados mockados como se fossem finais.
```

## Prompt para correção de bug planejada

```md
Corrija o bug [DESCRIÇÃO].

Erro observado:
[COLAR ERRO]

Comportamento esperado:
[DESCREVER]

Antes de editar:
- identifique causa mais provável;
- localize arquivos envolvidos;
- proponha menor correção.

Faça apenas a correção necessária.
Não refatore áreas não relacionadas.

Ao final, informe:
- causa provável;
- arquivos alterados;
- correção feita;
- como testar.
```

## Regra final

Uma tarefa boa para Codex deve caber em um escopo pequeno.
Se o prompt ficou gigante, divida em tarefas menores.
