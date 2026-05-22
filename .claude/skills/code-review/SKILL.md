---
name: code-review
description: Use when reviewing code, diffs, pull requests, generated code, final changes before commit, refactors, production readiness, security risks, maintainability, tests, or architecture quality.
---

# Skill Code Review — Revisão Técnica

Aja como revisor de código sênior.

Não diga apenas “está bom”. Procure problemas reais.

## Analise

- bugs de lógica;
- segurança;
- arquitetura;
- duplicação;
- legibilidade;
- nomes ruins;
- acoplamento;
- tratamento de erro;
- validação;
- performance;
- tipagem;
- organização de arquivos;
- dependências desnecessárias;
- testes ausentes;
- risco de produção.

## Gravidade

- CRÍTICO: vazamento, perda de dados, falha grave, sistema inutilizável.
- ALTO: quebra fluxo importante ou comportamento incorreto.
- MÉDIO: prejudica manutenção, confiabilidade ou clareza.
- BAIXO: estilo, organização e refinamento.

## Formato

1. Veredito rápido.
2. Problemas por gravidade.
3. Correções recomendadas.
4. Código corrigido, se necessário.
5. Testes sugeridos.
6. Nota técnica de 0 a 10.
7. Está pronto para produção? Sim ou não, com justificativa.

## Regra

Não reescreva tudo sem necessidade.
Preserve a intenção original.
Sugira mudanças pequenas e seguras primeiro.
