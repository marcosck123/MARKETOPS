# Pacote Claude Code — Skills, Subagent e Ralph Loop Seguro

Este pacote organiza suas skills para o Claude Code com uma estrutura limpa, compatível e mais segura.

## Estrutura principal

```txt
.claude/
├── CLAUDE.md
├── agents/
│   └── security-guardian.md
└── skills/
    ├── design-ux-ui/
    │   ├── SKILL.md
    │   └── references/
    ├── full-stack-planner/
    │   ├── SKILL.md
    │   └── references/
    ├── security-review/
    │   └── SKILL.md
    ├── route-audit/
    │   └── SKILL.md
    ├── ralph-agent/
    │   └── SKILL.md
    ├── prd/
    │   └── SKILL.md
    ├── ralph-prd-converter/
    │   └── SKILL.md
    ├── debug-terminal/
    │   └── SKILL.md
    └── code-review/
        └── SKILL.md
```

## Como instalar

1. Extraia o `.zip` na raiz do seu projeto.
2. Se já existir uma pasta `.claude`, faça backup antes.
3. Copie/mescle os arquivos deste pacote para dentro do projeto.
4. Abra o Claude Code na raiz do projeto.
5. Rode `/skills` para confirmar se as skills aparecem.

## Onde colocar suas skills antigas

Pelo seu print, você tinha algo parecido com:

```txt
.claude/Skills/
├── DESIGN/
├── PLAN FULLSTACK/
├── security-guardian/
└── Rotas.md
```

O recomendado é reorganizar assim:

```txt
.claude/skills/design-ux-ui/references/       ← arquivos grandes do DESIGN
.claude/skills/full-stack-planner/references/ ← arquivos grandes do PLAN FULLSTACK
.claude/agents/security-guardian.md           ← subagent de segurança
.claude/skills/route-audit/SKILL.md           ← skill de auditoria de rotas
```

Não deixe arquivos importantes soltos como `Rotas.md`, porque isso não vira skill automaticamente.

## Regra importante

Uma skill válida deve ter obrigatoriamente este formato:

```txt
.claude/skills/nome-da-skill/SKILL.md
```

Use nomes em kebab-case:

```txt
design-ux-ui
full-stack-planner
security-review
route-audit
ralph-agent
```

Evite:

```txt
DESIGN
PLAN FULLSTACK
Skills com S maiúsculo
nomes com espaço
```

## Como testar

No Claude Code, dentro do projeto:

```txt
/skills
```

Depois teste:

```txt
/design-ux-ui Analise uma tela de produtos com botões Novo Produto, Editar, Excluir e Ver Detalhes.
```

A resposta correta deve fazer perguntas bloqueadoras antes de criar layout.

## Ralph Loop

Este pacote também inclui:

```txt
scripts/ralph/prd.json
scripts/ralph/progress.txt
.claude/skills/ralph-agent/SKILL.md
```

O Ralph Agent está configurado para:

1. ler `scripts/ralph/prd.json`;
2. ler `scripts/ralph/progress.txt`;
3. escolher uma única story pendente;
4. aplicar o Skill Gate;
5. implementar apenas essa story;
6. rodar checks;
7. atualizar PRD e progresso;
8. revisar diff;
9. commitar mudanças intencionais.

Ele não deve ser usado para “melhorar o projeto inteiro” sem escopo.
