# Template — Decisões do Projeto e Handoff

Use este arquivo para registrar decisões que outros chats/agentes precisam lembrar.

## Nome do projeto

[Nome]

## Objetivo

[Explique o objetivo em 3 a 5 linhas]

## Stack decidida

Frontend:

Backend:

Banco:

Auth:

Storage:

Deploy:

Outros serviços:

## Usuários e permissões

| Perfil | Permissões | Restrições |
|---|---|---|
| Admin | ... | ... |
| Operador | ... | ... |
| Cliente | ... | ... |

## Módulos confirmados

| Módulo | MVP? | Fase | Observação |
|---|---|---|---|
| Auth | Sim | 1 | ... |
| Dashboard | Sim/Não | 1/2 | ... |
| Produtos | Sim | 1 | ... |

## Fluxos principais

### Fluxo 1: [Nome]

Passos:

1. ...
2. ...
3. ...

Resultado esperado:

...

## Banco de dados

Entidades confirmadas:

- ...
- ...
- ...

Relacionamentos importantes:

- ...

Soft delete:

- Sim/Não em quais entidades

## APIs / Actions confirmadas

| Método/Ação | Rota/Função | Permissão | Objetivo |
|---|---|---|---|
| GET | /... | ... | ... |
| POST | /... | ... | ... |

## Telas confirmadas

| Tela | Rota | Usuários | Ações principais |
|---|---|---|---|
| Login | /login | público | entrar |
| Dashboard | /dashboard | autenticado | visualizar resumo |

## Decisões importantes

- [Data] Decisão: ...
  Motivo: ...
  Impacto: ...

## Fora do escopo do MVP

- ...
- ...
- ...

## Riscos conhecidos

| Risco | Gravidade | Mitigação |
|---|---|---|
| ... | Alta/Média/Baixa | ... |

## Próximas tarefas

| ID | Tarefa | Agente indicado | Status |
|---|---|---|---|
| FS-001 | ... | Codex | Pendente |

## Handoff para Codex/Claude Code

```md
Contexto:
[Resumo do projeto]

Objetivo da próxima tarefa:
[Objetivo]

Escopo:
[Itens]

Arquivos prováveis:
[Arquivos]

Não alterar:
[Limites]

Critérios de aceite:
[Critérios]

Como testar:
[Testes]
```
