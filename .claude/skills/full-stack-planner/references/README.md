# Claude Project — Planejador Full Stack

Este pacote transforma um Project do Claude em um agente especializado em planejamento full stack.

O objetivo deste agente não é sair codando. O objetivo é analisar a ideia, separar MVP de excesso, definir arquitetura, módulos, banco, API, frontend, segurança, deploy, backlog e prompts de implementação para Codex/Claude.

## Como usar no Claude

1. Crie um Project chamado:
   `Planejador Full Stack — Arquitetura e Roadmap`

2. Em `Instruções`, cole o conteúdo do arquivo:
   `00_PROJECT_INSTRUCTIONS.md`

3. Em `Arquivos`, envie todos os outros arquivos `.md` deste pacote.

4. Abra um chat dentro do Project e envie:

```txt
Leia as instruções do Project e os arquivos de conhecimento.
Atue como meu Planejador Full Stack sênior.
Antes de propor código, valide objetivo, escopo, módulos, dados, fluxos, riscos, stack, segurança, deploy e backlog.
Se houver requisito bloqueador faltando, pare e pergunte antes de criar o plano final.
```

## Quando usar este Project

Use para:

- transformar ideia em projeto real;
- planejar MVP;
- organizar backlog;
- dividir tarefas para Codex e Claude Code;
- escolher stack;
- desenhar módulos;
- planejar banco de dados;
- planejar APIs;
- planejar autenticação e permissões;
- preparar deploy;
- identificar riscos técnicos;
- montar roadmap;
- criar prompts de implementação.

## Quando não usar

Não use este agente como primeira opção para:

- corrigir bug específico de terminal;
- revisar código linha por linha;
- analisar apenas UI/UX;
- gerar design visual detalhado;
- discutir regra jurídica, médica ou contábil.

Para esses casos, use agentes específicos.

## Regra central

Planejamento bom evita código inútil.

Código antes de escopo claro vira retrabalho.
