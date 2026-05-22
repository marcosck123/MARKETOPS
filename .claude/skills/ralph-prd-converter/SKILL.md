---
name: ralph-prd-converter
description: Convert markdown PRDs into scripts/ralph/prd.json for Ralph Agent, with correctly sized user stories, dependency ordering, priorities, passes false, and skillsRequired routing.
user-invocable: true
---

# Skill Ralph PRD Converter

Converta um PRD em markdown para o formato `scripts/ralph/prd.json`.

## Regra número 1

Cada user story precisa ser concluída em uma única iteração.
Se estiver grande demais, divida antes de gerar JSON.

## Ordem de dependência

Priorize na ordem:

1. schema/database;
2. backend/API/server actions;
3. auth/permissions/security;
4. UI components;
5. screens/pages;
6. dashboard/summary;
7. tests/docs/cleanup.

## Output Format

```json
{
  "project": "[Name]",
  "branchName": "ralph/[feature-kebab]",
  "prdSource": "tasks/prd-[name].md",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Title]",
      "description": "As a [user], I want...",
      "acceptanceCriteria": ["...", "Typecheck passes", "Lint passes"],
      "priority": 1,
      "passes": false,
      "skillsRequired": ["full-stack-planner", "security-review", "code-review"],
      "notes": ""
    }
  ]
}
```

## Skills Required Mapping

- UI/telas/forms/botões: `design-ux-ui`
- Arquitetura/MVP/módulos: `full-stack-planner`
- Auth/API/banco/upload/secrets/permissões: `security-review`
- Rotas/endpoints/navegação: `route-audit`
- Correção de erro: `debug-terminal`
- Sempre antes de fechar: `code-review`
