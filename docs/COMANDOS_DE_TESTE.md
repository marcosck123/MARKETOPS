# Comandos de teste no Claude Code

## Ver skills disponíveis

```txt
/skills
```

## Testar Design UX UI

```txt
/design-ux-ui Analise uma tela de produtos com botões Novo Produto, Editar, Excluir e Ver Detalhes.
```

Resultado esperado: deve fazer perguntas bloqueadoras sobre destino dos botões.

## Testar Planejador Full Stack

```txt
/full-stack-planner Quero criar um SaaS de estoque com login, produtos, vendas, relatórios e painel admin. Antes de código, valide MVP, módulos, banco, API, frontend, segurança, deploy e riscos.
```

Resultado esperado: deve separar MVP, excesso, arquitetura, módulos e riscos.

## Testar Segurança

```txt
/security-review Faça uma auditoria defensiva procurando secrets, auth fraca, APIs sem autorização, Supabase RLS, uploads inseguros e logs sensíveis. Não altere arquivos.
```

Resultado esperado: deve auditar em modo leitura e classificar riscos.

## Testar Rotas

```txt
/route-audit Faça auditoria das rotas frontend e API procurando duplicatas, órfãs, links quebrados, redirects estranhos e rotas inseguras. Não altere arquivos.
```

Resultado esperado: deve montar mapa de rotas e não sair deletando nada.

## Testar Ralph Agent

```txt
/ralph-agent Execute uma iteração Ralph segura. Leia scripts/ralph/prd.json e scripts/ralph/progress.txt. Implemente somente uma story pendente. Aplique Skill Gate antes de codar.
```

Resultado esperado: deve verificar branch, git status, PRD, progress e escolher uma única story.
