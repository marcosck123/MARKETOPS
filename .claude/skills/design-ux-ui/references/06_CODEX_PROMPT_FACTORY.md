# Codex Prompt Factory — Transformar UX/UI em Implementação

Este arquivo define como gerar prompts fortes para o Codex implementar interfaces sem inventar fluxo, rotas ou arquitetura desnecessária.

## 1. Objetivo

O Codex precisa receber instruções claras, restritivas e testáveis.

Não enviar prompts vagos como:

```txt
Crie uma tela bonita de produtos.
```

Isso permite que o Codex invente:

- rotas;
- componentes;
- estilos;
- dados falsos;
- páginas;
- fluxos;
- dependências;
- arquitetura desnecessária.

## 2. Regra principal

Só gerar prompt para Codex depois que o fluxo estiver claro.

Se houver botão ou rota indefinida, parar e perguntar antes.

## 3. Estrutura obrigatória do prompt

Todo prompt para Codex deve conter:

1. Contexto.
2. Objetivo.
3. Escopo.
4. Arquivos prováveis.
5. Módulos da tela.
6. Comportamento das ações.
7. Rotas e redirecionamentos.
8. Estados da interface.
9. Estilo visual.
10. Responsividade.
11. Acessibilidade.
12. Restrições.
13. O que não fazer.
14. Critérios de aceite.
15. Como testar.

## 4. Template principal

```txt
Você está trabalhando no projeto atual. Antes de editar, leia a estrutura existente e siga os padrões já usados.

Objetivo:
[descrever objetivo da tela]

Escopo:
Implementar apenas [tela/componente/fluxo].
Não refatorar áreas fora do escopo.
Não criar arquitetura nova sem necessidade.

Arquivos prováveis:
- [arquivo 1]
- [arquivo 2]
Se esses arquivos não existirem, localize o padrão equivalente no projeto antes de criar novos arquivos.

Módulos da interface:
1. [módulo]
2. [módulo]
3. [módulo]

Ações e comportamentos:
- Botão [nome]: [ação] → [destino/comportamento]
- Botão [nome]: [ação] → [destino/comportamento]
- Card [nome]: [clicável ou informativo]

Rotas:
- [rota existente ou nova]
Não inventar rotas além das listadas.

Estados obrigatórios:
- loading
- vazio
- erro
- sucesso
- sem permissão, se aplicável
- formulário inválido, se aplicável

Estilo visual:
- minimalista
- limpo
- profissional
- sem excesso de cards
- sem animações exageradas
- com hierarquia visual clara
- com espaçamento consistente

Responsividade:
- desktop: [comportamento]
- notebook: [comportamento]
- mobile: [comportamento]

Acessibilidade básica:
- labels em inputs
- foco visível
- contraste adequado
- botões com texto claro
- mensagens de erro próximas do contexto

Restrições:
- não criar dependências novas sem necessidade
- não alterar autenticação
- não alterar backend sem necessidade
- não mexer em rotas globais fora do escopo
- não criar dados falsos permanentes
- não remover comportamento existente

O que não fazer:
- não criar botão sem destino
- não criar tela decorativa
- não inventar modal/rota não especificada
- não refatorar o projeto inteiro
- não mudar design global sem pedido

Critérios de aceite:
- [critério 1]
- [critério 2]
- [critério 3]

Como testar:
- [passo 1]
- [passo 2]
- [passo 3]
```

## 5. Prompt para criar tela administrativa

```txt
Implemente uma tela administrativa para [recurso].

Antes de editar, leia os padrões existentes de páginas, componentes, rotas e estilos.

A tela deve conter:
- header com título, subtítulo curto e ação principal;
- busca simples;
- filtros básicos, se já existirem no projeto;
- tabela/lista com dados principais;
- ações por item;
- estado vazio;
- estado de erro;
- loading;
- responsividade básica.

Ações:
- [ação 1]: [destino]
- [ação 2]: [destino]
- [ação 3]: [destino]

Estilo:
- minimalista;
- limpo;
- profissional;
- sem efeitos visuais exagerados;
- sem excesso de cards;
- botões com hierarquia clara.

Não criar rotas ou botões além dos especificados.
Não criar dependências novas sem necessidade.
Não refatorar componentes globais.

Ao final, informe:
- arquivos alterados;
- o que foi implementado;
- como testar;
- limitações ou decisões assumidas.
```

## 6. Prompt para redesign de tela existente

```txt
Faça um redesign minimalista da tela [nome da tela].

Antes de alterar, analise a implementação atual e preserve o comportamento existente.

Objetivo do redesign:
- melhorar clareza;
- reduzir poluição visual;
- melhorar hierarquia;
- manter fluxo atual;
- melhorar responsividade;
- padronizar componentes.

Não alterar regras de negócio.
Não alterar backend.
Não alterar autenticação.
Não remover funcionalidades existentes.
Não criar botões novos sem destino definido.

Melhorias esperadas:
- organizar módulos;
- destacar ação principal;
- reduzir excesso visual;
- melhorar estados de loading/vazio/erro;
- melhorar labels e textos;
- ajustar mobile.

Ao final, explique:
- problemas encontrados;
- arquivos alterados;
- mudanças feitas;
- como testar visualmente;
- riscos.
```

## 7. Prompt para dashboard

```txt
Implemente uma dashboard minimalista para [contexto].

Objetivo:
Mostrar rapidamente os indicadores essenciais e permitir acesso às ações principais.

Módulos:
1. Header com título e ação principal.
2. Cards de indicadores essenciais.
3. Área de lista/tabela com dados recentes.
4. Filtros simples.
5. Estado vazio, erro e loading.

Ações:
- [botão principal]: [destino]
- [ação secundária]: [destino]
- [ver detalhes]: [modal/drawer/página]

Regras:
- não adicionar gráficos sem necessidade;
- não criar mais KPIs do que os definidos;
- não inventar dados;
- não criar rota além das listadas;
- manter visual limpo e profissional;
- garantir responsividade.
```

## 8. Prompt para formulário

```txt
Implemente o formulário de [recurso].

O formulário deve conter apenas os campos definidos:
- [campo 1]
- [campo 2]
- [campo 3]

Comportamento:
- Salvar: [ação/destino]
- Cancelar: [ação/destino]
- Erro de validação: mostrar próximo ao campo
- Sucesso: [toast/redirecionamento]

Regras:
- labels visíveis;
- placeholder não substitui label;
- botão salvar desabilitado durante envio;
- preservar dados se ocorrer erro;
- confirmação ao sair com alterações não salvas, se aplicável;
- layout responsivo.

Não criar campos extras.
Não inventar validação de negócio.
Não alterar schema sem pedido.
```

## 9. Prompt para PDV/Caixa

```txt
Implemente ou revise a tela de PDV/Caixa com foco em velocidade, clareza e baixo erro operacional.

Objetivo:
Permitir que o operador adicione itens, veja a lista da venda, execute operações e finalize/cancele com segurança.

Módulos:
1. Header com identificação da operação atual.
2. Área de busca/adicionar produto ou abastecimento.
3. Lista de itens da venda.
4. Resumo de valores.
5. Operações disponíveis.
6. Ações finais: finalizar, cancelar, voltar.
7. Estados de erro, loading e venda vazia.

Regras de UX:
- ação principal sempre visível;
- operações com destino claro;
- cancelar venda precisa confirmação;
- finalizar venda precisa feedback;
- busca deve ser rápida;
- evitar elementos decorativos;
- priorizar teclado e fluxo rápido.

Não criar operação sem comportamento definido.
Não inventar forma de pagamento se não foi especificada.
Não mudar regra de negócio fora do escopo.
```

## 10. Critérios de bom prompt

Um bom prompt para Codex deve ser:

- específico;
- restritivo;
- claro;
- testável;
- pequeno o suficiente para executar;
- alinhado ao projeto existente;
- sem abrir margem para invenção.

## 11. Regra final

O Claude Project de Design pensa.
O Codex implementa.

Se o pensamento estiver vago, o código sairá errado.
