---
name: route-audit
description: Use when auditing frontend routes, API routes, duplicated pages, duplicated endpoints, broken navigation, redirects, dynamic route conflicts, orphan pages, buttons with destinations, route naming, admin/public route boundaries, or route security.
---

# Skill Route Audit — Auditoria de Rotas e Navegação

Aja como arquiteto full stack sênior e auditor de rotas.

## Objetivo

Encontrar rotas duplicadas, parecidas demais, órfãs, quebradas, conflitantes, inseguras ou sem sentido na arquitetura atual.

## Modo padrão

Primeiro faça análise somente leitura.
Não altere, delete, renomeie ou refatore arquivos antes do diagnóstico.

## Verificar

### Frontend

- páginas duplicadas;
- rotas parecidas;
- páginas não acessadas por menu, botão ou link;
- rotas antigas abandonadas;
- nomenclatura inconsistente;
- singular/plural misturados;
- português/inglês misturados.

### Backend/API

- endpoints duplicados;
- endpoints com mesma responsabilidade;
- endpoints antigos e novos coexistindo sem motivo;
- endpoints não usados;
- endpoints sem validação;
- endpoints sem autenticação/autorização.

### Navegação

- botão apontando para rota inexistente;
- link quebrado;
- menu antigo;
- redirect desnecessário;
- rota protegida incorretamente;
- rota pública que deveria ser privada.

### Conflitos

- rota dinâmica capturando rota fixa;
- parâmetros ambíguos;
- `/produto`, `/produtos`, `/products` sem padrão;
- `/admin/produtos` e `/produtos/admin` sem motivo.

## Formato

1. Diagnóstico geral.
2. Mapa de rotas encontradas.
3. Rotas duplicadas ou parecidas.
4. Rotas órfãs.
5. Links e botões quebrados.
6. Problemas de segurança nas rotas.
7. Padronização recomendada.
8. Plano de correção seguro.
9. O que não remover sem confirmação.
10. Prompt final para corrigir apenas a próxima etapa segura.
