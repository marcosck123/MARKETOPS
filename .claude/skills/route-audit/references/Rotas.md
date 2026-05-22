Atue como um arquiteto full stack sênior e auditor de rotas.

Quero que você analise o projeto em modo somente leitura primeiro.

Objetivo:
Encontrar rotas duplicadas, rotas parecidas demais, rotas sem função clara, rotas órfãs, rotas quebradas, rotas conflitantes e rotas que não fazem sentido na arquitetura atual.

Não altere nenhum arquivo ainda.
Não delete nada.
Não renomeie nada.
Não refatore nada.
Primeiro apenas analise e me entregue um diagnóstico.

Analise obrigatoriamente:

1. Rotas de frontend
- páginas duplicadas;
- páginas com nomes parecidos;
- rotas que apontam para telas quase iguais;
- rotas que não são acessadas por nenhum menu, botão ou link;
- rotas antigas que parecem abandonadas;
- rotas que deveriam estar agrupadas;
- rotas com nomenclatura inconsistente.

2. Rotas de backend/API
- endpoints duplicados;
- endpoints com a mesma responsabilidade;
- endpoints antigos e novos coexistindo sem motivo;
- endpoints que retornam dados parecidos;
- endpoints que não são usados pelo frontend;
- endpoints sem validação clara;
- endpoints com nomes inconsistentes;
- endpoints que deveriam ser unificados.

3. Redirecionamentos e navegação
- botões que levam para rotas inexistentes;
- links quebrados;
- menus apontando para rotas antigas;
- redirects desnecessários;
- rotas acessíveis diretamente, mas sem entrada na UI;
- rotas protegidas incorretamente;
- rotas públicas que deveriam ser privadas.

4. Conflitos de rotas
- rotas dinâmicas que podem capturar rotas fixas;
- rotas com parâmetros ambíguos;
- rotas duplicadas por diferença de singular/plural;
- exemplo: /produto, /produtos, /products;
- exemplo: /cliente, /clientes, /customers;
- exemplo: /admin/produtos e /produtos/admin sem motivo claro.

5. Arquivos e estrutura
- arquivos de página duplicados;
- componentes de página muito parecidos;
- rotas criadas em lugares errados;
- pastas com nomes inconsistentes;
- arquivos mortos relacionados a rotas antigas.

Para cada problema encontrado, classifique a gravidade:

CRÍTICO:
Rota quebrada, conflito real, risco de usuário acessar tela errada, bypass de autenticação/permissão ou endpoint perigoso.

ALTO:
Duplicação que pode causar bug, manutenção difícil, inconsistência importante ou comportamento divergente.

MÉDIO:
Rota confusa, nome ruim, duplicação parcial ou fluxo pouco claro.

BAIXO:
Organização, padronização, nomenclatura ou limpeza.

Formato obrigatório da resposta:

## 1. Diagnóstico geral

Explique se a estrutura de rotas está saudável ou confusa.

## 2. Mapa de rotas encontradas

Crie uma tabela com:

- rota;
- tipo: frontend, API, redirect, layout, middleware;
- arquivo responsável;
- função aparente;
- status: ativa, suspeita, duplicada, órfã, quebrada ou indefinida.

## 3. Rotas duplicadas ou parecidas

Para cada caso, mostre:

- rota A;
- rota B;
- arquivos envolvidos;
- por que parecem duplicadas;
- se a duplicação parece intencional ou problemática;
- recomendação: manter, unificar, renomear, redirecionar ou remover.

## 4. Rotas sem sentido ou órfãs

Liste rotas que parecem não ser usadas por:

- sidebar;
- navbar;
- botões;
- links;
- redirects;
- chamadas do frontend;
- testes;
- documentação.

Explique por que parecem órfãs.

## 5. Links e botões quebrados

Liste qualquer botão, link, menu ou CTA que aponta para rota inexistente ou indefinida.

Mostre:

- texto do botão/link;
- arquivo onde aparece;
- destino atual;
- problema;
- destino recomendado.

## 6. Problemas de segurança nas rotas

Verifique:

- rota admin pública;
- API sem autenticação;
- API sem autorização;
- rota protegida apenas no frontend;
- permissões inconsistentes;
- middleware ausente;
- usuário comum podendo acessar área restrita.

Se encontrar risco crítico, pare e marque como BLOQUEIO.

## 7. Recomendações de padronização

Sugira um padrão único de nomenclatura.

Exemplo:

- usar plural para recursos: /produtos, /clientes, /vendas;
- usar /admin apenas para área administrativa;
- usar /api/[recurso] para endpoints;
- evitar mistura de inglês e português;
- evitar rotas duplicadas com o mesmo objetivo.

## 8. Plano de correção seguro

Monte um plano em fases:

Fase 1:
Corrigir links quebrados e conflitos críticos.

Fase 2:
Unificar rotas duplicadas.

Fase 3:
Remover rotas órfãs somente após confirmação.

Fase 4:
Padronizar nomes e atualizar navegação.

## 9. O que NÃO deve ser removido sem confirmação

Liste rotas suspeitas que podem ser antigas, mas ainda podem ter uso oculto.

Não recomende deletar diretamente sem evidência forte.

## 10. Prompt final para implementação

No final, gere um prompt separado para o Codex corrigir apenas a próxima etapa mais segura.

Regras para o prompt final:
- mudanças pequenas;
- não deletar rota sem confirmação;
- não refatorar o projeto inteiro;
- preservar comportamento atual;
- atualizar links e imports relacionados;
- testar build/lint;
- listar arquivos alterados.

Importante:
Se você não tiver certeza se uma rota é inútil, diga que é suspeita, não afirme como certeza.