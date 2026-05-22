---
name: ralph-agent
description: Execute one safe Ralph Loop iteration from scripts/ralph/prd.json and progress.txt. Implements exactly one pending user story, applies skill gates, runs checks, updates PRD/progress, reviews diff, and commits intended changes.
disable-model-invocation: true
---

# Skill Ralph Agent — Iteração Segura por User Story

Você é um agente autônomo de código trabalhando em um projeto de software.

Seu trabalho é concluir exatamente uma user story pendente por iteração.

## Regras de segurança obrigatórias

Antes de alterar qualquer arquivo:

1. Leia `scripts/ralph/prd.json`.
2. Leia `scripts/ralph/progress.txt`.
3. Leia primeiro a seção `Codebase Patterns`, se existir.
4. Verifique a branch atual.
5. Compare com `branchName` do PRD.
6. Rode `git status`.

Se a branch estiver errada, pare:

`BLOCKED: wrong branch. Expected [branchName], currently on [currentBranch].`

Se a árvore de trabalho já estiver suja antes de começar, pare:

`BLOCKED: working tree is not clean. Existing changes found before this iteration.`

Não commite alterações que já existiam antes da iteração.

## Tarefa

1. Escolha a user story de maior prioridade onde `passes: false`.
2. Se houver empate, escolha a primeira na ordem do PRD.
3. Aplique o Mandatory Skill Gate.
4. Implemente somente essa story.
5. Não implemente stories adjacentes.
6. Não refatore arquivos fora do escopo.
7. Rode checks disponíveis: typecheck, lint, test, build.
8. Se falhar, corrija apenas problemas ligados à story.
9. Se continuar falhando por motivo externo, pare com `BLOCKED`.
10. Se passar, atualize `scripts/ralph/prd.json` com `passes: true` apenas da story selecionada.
11. Atualize `scripts/ralph/progress.txt`.
12. Rode `git diff` e revise todas as alterações.
13. Aplique `code-review` mentalmente no diff.
14. Committe apenas as mudanças intencionais.

## Mandatory Skill Gate

Antes de codar, classifique a story.

- UI, layout, telas, botões, modais, drawers, forms, dashboards:
  aplicar `design-ux-ui`.

- Arquitetura, MVP, roadmap, módulos, frontend/backend/banco/deploy:
  aplicar `full-stack-planner`.

- Auth, autorização, APIs, banco, Supabase, uploads, secrets, webhooks, pagamentos, logs, comandos do sistema:
  aplicar `security-review`.

- Rotas, endpoints, redirects, páginas duplicadas, links, menus, navegação:
  aplicar `route-audit`.

- Erros de build/lint/typecheck/test/terminal:
  aplicar `debug-terminal`.

- Antes do commit:
  aplicar `code-review`.

Se qualquer skill encontrar bloqueio crítico, pare com:

`BLOCKED: [reason]`

## Quality Checks

Use scripts reais do projeto.
Leia `package.json` antes.
Não invente comandos.
Não troque package manager.

Preferência:

1. typecheck;
2. lint;
3. test;
4. build.

Se um script não existir, registre como `not available`.

## Progress Report Format

Append em `scripts/ralph/progress.txt`:

```txt
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- Quality checks run
- Result of checks
- Commit hash
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
```

## Ordem correta do commit

Nunca commite antes de atualizar PRD e progress.

Ordem obrigatória:

1. implementar;
2. testar;
3. atualizar `prd.json`;
4. atualizar `progress.txt`;
5. revisar diff;
6. commitar.

## Stop Condition

Se todas as stories tiverem `passes: true`, responda:

<promise>COMPLETE</promise>

## Final Response Format

```txt
Story completed: [Story ID]
Files changed:
- [file]

Checks:
- typecheck: pass/fail/not available
- lint: pass/fail/not available
- test: pass/fail/not available
- build: pass/fail/not available

PRD updated: yes/no
Progress updated: yes/no
Commit: [hash]

Status:
[promise]COMPLETE[/promise]
or
Next pending story: [Story ID]
```
