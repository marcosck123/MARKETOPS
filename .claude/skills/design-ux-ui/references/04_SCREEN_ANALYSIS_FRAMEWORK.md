# Framework de Análise de Tela

Este arquivo define o modelo de análise profunda para qualquer tela solicitada pelo usuário.

## 1. Quando usar

Use este framework quando o usuário pedir:

- criar uma tela;
- revisar uma tela;
- melhorar um layout;
- transformar ideia em UI;
- gerar prompt para Codex;
- redesenhar dashboard;
- criar fluxo de sistema;
- analisar print ou wireframe;
- montar estrutura de página.

## 2. Ordem obrigatória de raciocínio

Nunca pular esta ordem:

1. Diagnóstico.
2. Usuário.
3. Objetivo.
4. Fluxo.
5. Ações.
6. Módulos.
7. Hierarquia visual.
8. Componentes.
9. Estados.
10. Responsividade.
11. Acessibilidade.
12. Riscos.
13. Prompt para implementação.

## 3. Diagnóstico direto

Responder:

- Qual é a tela?
- Para que ela existe?
- Qual tarefa ela permite concluir?
- Qual problema ela resolve?
- Qual é o risco principal se for mal feita?

Exemplo:

```txt
A tela de produtos não deve ser apenas uma lista visual. Ela precisa permitir localizar, cadastrar, editar, excluir e entender o estado dos produtos sem confundir o usuário.
```

## 4. Usuário e contexto

Identificar:

- Quem usa?
- Com que frequência?
- Com qual nível técnico?
- Em qual dispositivo?
- Em qual situação?
- O usuário está com pressa?
- O usuário pode cometer erro grave?

Exemplo:

```txt
Se o usuário for operador de caixa, a tela precisa priorizar velocidade e poucos cliques. Se for administrador, pode aceitar mais filtros e ações avançadas.
```

## 5. Objetivo principal

Toda tela deve ter uma ação principal.

Exemplos:

- Login: entrar no sistema.
- Dashboard: entender status e acessar ações rápidas.
- Produtos: gerenciar catálogo.
- PDV: concluir venda rapidamente.
- Relatórios: analisar dados e exportar.
- Configurações: ajustar regras do sistema.

Se a tela tiver mais de uma ação principal, provavelmente está confusa.

## 6. Mapa de ações

Obrigatório para toda tela.

Formato:

| Elemento | Tipo | Ação | Destino | Status |
|---|---|---|---|---|
| Salvar | Botão primário | Enviar formulário | Permanece ou redireciona | Precisa confirmar |
| Cancelar | Botão secundário | Abandonar edição | Voltar para lista | Sugerido |
| Excluir | Botão destrutivo | Remover item | Modal de confirmação | Confirmado |

## 7. Módulos da tela

Dividir a tela em blocos funcionais.

Exemplos:

### Dashboard

- Header;
- filtros rápidos;
- KPIs principais;
- gráfico ou resumo;
- lista recente;
- alertas;
- ações rápidas.

### Lista administrativa

- Header com ação principal;
- busca;
- filtros;
- tabela;
- paginação;
- ações por item;
- estado vazio.

### Formulário

- Header;
- grupo de campos principais;
- grupo de campos secundários;
- validações;
- ações fixas ou no final;
- confirmação de saída se houver alteração.

### PDV

- busca/adicionar item;
- lista/carrinho;
- resumo financeiro;
- operações;
- ações de finalizar/cancelar;
- feedback rápido.

## 8. Hierarquia visual

Definir:

1. O que o usuário deve ver primeiro.
2. O que ele deve fazer primeiro.
3. O que pode ficar secundário.
4. O que pode ficar escondido.
5. O que não deveria aparecer.

### Sinais de hierarquia ruim

- todos os botões parecem importantes;
- todos os cards têm o mesmo peso;
- a ação principal está escondida;
- informação secundária aparece antes da principal;
- excesso de cor competindo.

## 9. Layout recomendado

Sempre descrever:

### Desktop

- organização em colunas;
- sidebar ou header;
- área principal;
- largura dos módulos;
- posição de ações.

### Notebook

- o que reduz;
- o que compacta;
- o que permanece visível.

### Mobile

- como empilha;
- o que vira menu;
- o que vira lista;
- como ações principais ficam acessíveis;
- como evitar tabela quebrada.

## 10. Componentes necessários

Listar componentes prováveis:

- Button;
- Input;
- Select;
- Textarea;
- Checkbox;
- Radio;
- Card;
- Table;
- Badge;
- Tabs;
- Modal;
- Drawer;
- Toast;
- Skeleton;
- Empty State;
- Alert;
- Breadcrumb;
- Pagination;
- Dropdown;
- Sidebar;
- Header.

Não adicionar componente sem função clara.

## 11. Estados da interface

Toda tela precisa considerar:

- loading inicial;
- loading de ação;
- vazio;
- erro;
- sucesso;
- sem permissão;
- formulário inválido;
- busca sem resultado;
- offline ou falha de rede, quando relevante;
- confirmação antes de ação crítica.

## 12. UX Writing

Avaliar:

- título;
- subtítulo;
- labels;
- placeholders;
- botões;
- mensagens de erro;
- mensagens de sucesso;
- texto de estado vazio;
- texto de confirmação.

### Regras

- texto curto;
- verbo claro;
- evitar ambiguidade;
- evitar termo técnico sem necessidade;
- não culpar usuário;
- orientar próximo passo.

## 13. Riscos de UX/UI

Classificar riscos:

### CRÍTICO

Impede uso ou entendimento da ação principal.

### ALTO

Prejudica ação importante ou causa erro provável.

### MÉDIO

Afeta clareza, consistência ou manutenção.

### BAIXO

Refinamento visual ou ajuste de estilo.

## 14. O que evitar

Sempre listar excessos possíveis:

- botões demais;
- ações sem destino;
- cards demais;
- dados demais no topo;
- layout sem mobile;
- tabela sem estado vazio;
- formulário sem validação;
- texto genérico;
- animação inútil;
- design bonito que não resolve fluxo.

## 15. Prompt final para Codex

Só gerar prompt final quando o fluxo estiver claro.

O prompt deve conter:

- contexto;
- objetivo;
- arquivos prováveis;
- módulos;
- componentes;
- rotas;
- estados;
- responsividade;
- restrições;
- o que não fazer;
- como testar visualmente.

## 16. Regra final

Se a tela ainda não tem fluxo, não gere layout final.
Se a ação ainda não tem destino, não gere prompt para Codex.
