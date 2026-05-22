# Como migrar suas skills atuais para Claude Code

Pelo seu print, você já tem skills, mas algumas estão em formato de pasta de referência, não no formato de skill real.

## 1. Renomeie a pasta principal

Atual:

```txt
.claude/Skills/
```

Recomendado:

```txt
.claude/skills/
```

No Windows pode parecer igual, mas em Linux/devcontainer maiúsculas e minúsculas importam.

## 2. Design

Atual:

```txt
.claude/Skills/DESIGN/
```

Recomendado:

```txt
.claude/skills/design-ux-ui/
├── SKILL.md
└── references/
    ├── 00_PROJECT_INSTRUCTIONS.md
    ├── 01_MASTER_DESIGN_UX_UI_SYSTEM.md
    └── ...
```

O `SKILL.md` deve ser curto e dizer quando usar a skill.
Os arquivos grandes ficam em `references/`.

## 3. Planejador Full Stack

Atual:

```txt
.claude/Skills/PLAN FULLSTACK/
```

Recomendado:

```txt
.claude/skills/full-stack-planner/
├── SKILL.md
└── references/
    ├── 01_MASTER_FULL_STACK_PLANNER.md
    └── ...
```

## 4. Rotas

Atual:

```txt
.claude/Skills/Rotas.md
```

Recomendado:

```txt
.claude/skills/route-audit/SKILL.md
```

Se o seu `Rotas.md` for muito grande, coloque assim:

```txt
.claude/skills/route-audit/
├── SKILL.md
└── references/
    └── Rotas.md
```

## 5. Security Guardian

Se for uma skill:

```txt
.claude/skills/security-review/SKILL.md
```

Se for subagent:

```txt
.claude/agents/security-guardian.md
```

Minha recomendação:

- `security-review` como skill para revisão rápida.
- `security-guardian` como subagent para análise isolada e pesada.

## 6. Comandos PowerShell seguros

Faça backup antes:

```powershell
Copy-Item -Recurse .claude .claude_backup
```

Crie estrutura correta:

```powershell
New-Item -ItemType Directory -Force .claude\skills\design-ux-ui\references
New-Item -ItemType Directory -Force .claude\skills\full-stack-planner\references
New-Item -ItemType Directory -Force .claude\skills\route-audit
New-Item -ItemType Directory -Force .claude\agents
```

Copie os arquivos de referência:

```powershell
Copy-Item .claude\Skills\DESIGN\*.md .claude\skills\design-ux-ui\references\
Copy-Item ".claude\Skills\PLAN FULLSTACK\*.md" .claude\skills\full-stack-planner\references\
```

Não apague a pasta antiga até testar com `/skills`.

## 7. Teste

No Claude Code:

```txt
/skills
```

Você deve ver:

```txt
design-ux-ui
full-stack-planner
security-review
route-audit
ralph-agent
prd
ralph-prd-converter
debug-terminal
code-review
```
