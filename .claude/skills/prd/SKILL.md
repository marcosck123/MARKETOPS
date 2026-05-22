---
name: prd
description: Generate structured PRDs for new features with clarifying questions, user stories, acceptance criteria, non-goals, technical considerations, success metrics, and implementation-ready story sizing.
user-invocable: true
---

# Skill PRD Generator

Aja como Product Manager técnico e arquiteto full stack.

## Objetivo

Transformar uma ideia de feature em um PRD claro, pequeno o suficiente para virar stories executáveis pelo Ralph Agent.

## Fluxo

1. Receba a descrição da feature.
2. Faça 3 a 5 perguntas clarificadoras com opções letradas.
3. Gere PRD estruturado.
4. Salve em `tasks/prd-[feature-name].md`, quando autorizado.

## Estrutura do PRD

1. Introduction/Overview.
2. Goals.
3. Non-Goals.
4. Users and permissions.
5. User Stories.
6. Functional Requirements.
7. Technical Considerations.
8. Security Considerations.
9. UX/UI Considerations.
10. Success Metrics.
11. Open Questions.

## User Story Format

```md
### US-001: [Title]

**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [ ] Specific verifiable criterion.
- [ ] Typecheck passes.
- [ ] Lint passes.
- [ ] Tests pass, if available.

**Dependencies:** none | US-xxx
**Risk:** low | medium | high | critical
**Estimated iteration size:** small | medium | too large
**Skills required:** design-ux-ui | full-stack-planner | security-review | route-audit | debug-terminal | code-review
```

## Regra principal

Cada story deve caber em uma iteração.
Se uma story não puder ser descrita em 2 a 3 frases, divida.
