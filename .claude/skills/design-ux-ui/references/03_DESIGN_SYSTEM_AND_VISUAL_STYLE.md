# Design System e Estilo Visual

Este arquivo define as regras visuais, componentes, padrões e estilo minimalista do Project.

## 1. Princípio visual

A interface deve parecer simples porque foi bem pensada.

Minimalismo aqui significa:

- menos ruído;
- menos elementos competindo;
- mais clareza;
- mais foco;
- melhor leitura;
- menos esforço mental.

Não significa tela vazia, pobre ou sem identidade.

## 2. Personalidade visual

O estilo deve ser:

- profissional;
- limpo;
- moderno;
- silencioso;
- confiável;
- objetivo;
- organizado;
- sem exagero.

A interface deve transmitir controle e clareza, não espetáculo.

## 3. Cores

Usar poucas cores.

### Regras

- Uma cor primária para ações principais.
- Neutros para estrutura.
- Cores semânticas para status.
- Poucas variações.
- Não usar cor para tudo.
- Não depender apenas de cor para transmitir informação.

### Cores semânticas

- Sucesso: apenas para confirmação positiva.
- Erro: apenas para falha, perigo ou validação.
- Alerta: apenas para atenção necessária.
- Informação: apenas para orientação neutra.

### Evitar

- gradientes decorativos;
- neon;
- excesso de saturação;
- muitos destaques simultâneos;
- botões de cores diferentes sem lógica.

## 4. Tipografia

A tipografia deve melhorar leitura.

### Regras

- Títulos claros e curtos.
- Subtítulos explicativos, mas não longos.
- Corpo de texto legível.
- Labels visíveis.
- Mensagens de erro objetivas.
- Não usar muitos tamanhos diferentes.

### Hierarquia sugerida

- Título da página: maior e forte.
- Subtítulo/contexto: menor e neutro.
- Seção: médio e claro.
- Texto comum: legível.
- Texto auxiliar: discreto.

## 5. Espaçamento

Espaçamento é parte da experiência.

### Regras

- Agrupar elementos relacionados.
- Separar blocos diferentes.
- Dar respiro em áreas densas.
- Não apertar tabelas e formulários.
- Não usar espaçamentos aleatórios.

### Erros comuns

- muitos cards colados;
- tabela apertada;
- formulário sem agrupamento;
- botões longe demais do contexto;
- header grande demais para sistema administrativo.

## 6. Botões

Botões precisam refletir prioridade.

### Tipos

#### Primário

Use para a ação principal da tela.

Exemplos:

- Nova venda
- Salvar
- Continuar
- Finalizar
- Criar produto

Regra: normalmente só deve existir um botão primário dominante por área principal.

#### Secundário

Use para ações importantes, mas não principais.

Exemplos:

- Cancelar
- Voltar
- Filtrar
- Exportar
- Ver detalhes

#### Terciário ou ghost

Use para ações leves.

Exemplos:

- Limpar filtros
- Ver mais
- Abrir ajuda

#### Destrutivo

Use para ações perigosas.

Exemplos:

- Excluir
- Cancelar pedido
- Remover item

Regra: ação destrutiva precisa de confirmação.

## 7. Inputs e formulários

Formulários devem ser simples e previsíveis.

### Regras

- Cada campo deve ter label.
- Placeholder não substitui label.
- Campos obrigatórios devem ser claros.
- Erros devem aparecer perto do campo.
- Agrupar campos por contexto.
- Evitar formulário longo sem seções.
- Botão de salvar deve ficar em local previsível.
- Não esconder erro apenas em toast.

### Estados de input

- padrão;
- foco;
- preenchido;
- erro;
- desabilitado;
- somente leitura;
- loading, se buscar dado externo.

## 8. Cards

Cards só devem existir se ajudarem a separar contexto.

### Bons usos

- resumo de indicador;
- agrupamento de informação;
- item de lista visual;
- opção de escolha;
- bloco de configuração.

### Maus usos

- colocar tudo em card;
- usar card apenas por estética;
- criar muitos cards pequenos;
- card clicável sem parecer clicável;
- card clicável sem destino claro.

## 9. Tabelas

Tabelas são para comparação e gestão.

### Regras

- Colunas essenciais primeiro.
- Ações no final ou agrupadas.
- Cabeçalhos claros.
- Filtros acima da tabela.
- Busca visível se for importante.
- Estado vazio claro.
- Paginação se tiver muitos dados.
- Não esconder ação principal.

### Evitar

- colunas demais;
- botões demais por linha;
- ícones sem label quando não forem óbvios;
- tabela impossível no mobile;
- linha clicável sem indicação.

## 10. Modais

Modais devem ser usados com cuidado.

### Bons usos

- confirmação;
- ação curta;
- detalhe rápido;
- formulário pequeno.

### Regras

- Título direto.
- Texto curto.
- Ação principal clara.
- Botão cancelar visível.
- Fechar não pode causar perda silenciosa de dados.

## 11. Drawers

Drawers são úteis para manter contexto.

### Bons usos

- detalhe de item em tabela;
- edição rápida;
- resumo lateral;
- carrinho lateral;
- filtros avançados.

### Regras

- Não colocar fluxo enorme dentro de drawer.
- Em mobile, drawer pode virar tela cheia.
- Manter botão de fechar claro.

## 12. Sidebar

Sidebar deve facilitar navegação, não competir com conteúdo.

### Regras

- Itens claros.
- Agrupamento por contexto.
- Estado ativo visível.
- Ícone só se ajudar.
- Não exagerar em submenus.
- Evitar sidebar gigante em MVP.

## 13. Header

Header deve orientar.

### Pode conter

- título da tela;
- breadcrumb;
- ação principal;
- busca global, se existir;
- perfil/configuração, se necessário.

### Evitar

- muitos botões;
- informações repetidas;
- altura excessiva;
- banner visual sem função.

## 14. Ícones

Ícones devem ajudar reconhecimento.

### Regras

- Não usar ícone como decoração aleatória.
- Ícone crítico deve ter texto ou tooltip.
- Manter estilo consistente.
- Evitar muitos ícones competindo.

## 15. Animações

Animações devem ser discretas.

### Permitido

- transição leve;
- feedback de loading;
- abertura suave de modal/drawer;
- hover discreto.

### Evitar

- animação longa;
- efeito chamativo;
- movimento que atrapalha leitura;
- animação em dados importantes;
- animação que mascara lentidão.

## 16. Layout desktop

Priorizar:

- largura bem distribuída;
- hierarquia clara;
- sidebar ou navegação previsível;
- conteúdo principal dominante;
- ações próximas do contexto.

## 17. Layout mobile

Priorizar:

- conteúdo empilhado;
- botões fáceis de tocar;
- menu simplificado;
- tabelas transformadas em cards/listas quando necessário;
- filtros recolhíveis;
- ações críticas claras.

## 18. Regra final do design system

Consistência vale mais que criatividade solta.

Se cada tela usa um padrão diferente, o usuário precisa reaprender o sistema toda hora.
