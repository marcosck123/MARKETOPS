# Acessibilidade, QA e Estados de Interface

Este arquivo define os critérios mínimos para acessibilidade, testes de interface e estados obrigatórios.

## 1. Princípio

Uma tela real não é apenas o estado ideal.

Toda interface precisa funcionar quando:

- carrega;
- falha;
- está vazia;
- o usuário erra;
- o usuário não tem permissão;
- a ação demora;
- a busca não encontra nada;
- o dispositivo é pequeno;
- o usuário navega por teclado;
- o usuário precisa entender uma mensagem rapidamente.

## 2. Estados obrigatórios

### 2.1 Loading inicial

Usar quando dados ainda estão carregando.

Boas práticas:

- skeleton quando layout for conhecido;
- spinner apenas para carregamento curto;
- texto claro se a espera for importante;
- não deixar tela em branco.

### 2.2 Loading de ação

Usar quando usuário clica em salvar, excluir, finalizar, exportar etc.

Regras:

- desabilitar botão durante envio;
- mostrar estado de processamento;
- impedir duplo clique;
- manter feedback visível.

Exemplo de texto:

- Salvando...
- Finalizando venda...
- Exportando relatório...

### 2.3 Estado vazio

Usar quando não existem dados.

Deve responder:

- O que aconteceu?
- Por que está vazio?
- O que o usuário pode fazer agora?

Exemplo ruim:

```txt
Nenhum dado.
```

Exemplo bom:

```txt
Nenhum produto cadastrado ainda.
Cadastre o primeiro produto para começar a vender.
[Cadastrar produto]
```

### 2.4 Busca sem resultado

Diferente de estado vazio geral.

Exemplo:

```txt
Nenhum produto encontrado para "arroz".
Tente outro termo ou limpe os filtros.
```

### 2.5 Erro

Erro deve explicar e orientar.

Evitar:

```txt
Erro inesperado.
```

Preferir:

```txt
Não foi possível carregar os produtos.
Verifique sua conexão e tente novamente.
[Tentar novamente]
```

### 2.6 Sucesso

Confirmar o que aconteceu.

Exemplos:

- Produto salvo com sucesso.
- Venda finalizada.
- Relatório exportado.
- Alterações aplicadas.

Evitar mensagem vaga:

```txt
Concluído.
```

### 2.7 Sem permissão

Não esconder apenas.
Explicar quando fizer sentido.

Exemplo:

```txt
Você não tem permissão para acessar relatórios financeiros.
Fale com um administrador se precisar dessa função.
```

### 2.8 Formulário inválido

Regras:

- indicar campo específico;
- explicar o erro;
- não usar apenas cor;
- impedir envio;
- manter dados preenchidos.

### 2.9 Confirmação de ação crítica

Ações críticas exigem confirmação.

Exemplos:

- excluir;
- cancelar venda;
- apagar registro;
- remover usuário;
- alterar permissão;
- limpar dados;
- finalizar processo irreversível.

Confirmação deve explicar consequência.

Exemplo:

```txt
Excluir produto?
Essa ação removerá o produto da lista. Vendas antigas não serão alteradas.
[Cancelar] [Excluir produto]
```

## 3. Checklist de acessibilidade básica

Verificar:

- contraste suficiente;
- fonte legível;
- botões com tamanho clicável;
- foco visível;
- labels em todos os inputs;
- mensagens de erro próximas do campo;
- navegação por teclado;
- ordem lógica de tabulação;
- texto alternativo quando houver imagem importante;
- não depender apenas de cor;
- linguagem simples;
- mobile utilizável.

## 4. Contraste

Regra prática:

- texto principal precisa ter contraste forte;
- texto secundário pode ser mais discreto, mas ainda legível;
- botões precisam manter leitura em hover/disabled;
- erro e alerta precisam ser visíveis.

Evitar:

- cinza muito claro em fundo claro;
- texto pequeno com baixo contraste;
- placeholder como informação principal;
- ícone sem texto em ação crítica.

## 5. Foco e teclado

Toda ação importante deve ser acessível por teclado.

Verificar:

- botão recebe foco;
- modal prende foco corretamente;
- ESC fecha modal quando seguro;
- Enter confirma quando apropriado;
- Tab segue ordem lógica;
- foco não desaparece.

## 6. Mobile

Verificar:

- botões grandes o suficiente;
- elementos não ficam espremidos;
- tabela vira lista/card se necessário;
- filtros podem recolher;
- ação principal continua acessível;
- modais não quebram em tela pequena;
- drawer pode virar tela cheia.

## 7. QA visual

Verificar:

- alinhamento;
- espaçamento consistente;
- elementos não sobrepõem;
- textos não cortam;
- tabela não explode largura;
- estados disabled visíveis;
- hover e focus coerentes;
- layout funciona com dados longos;
- layout funciona com dados vazios.

## 8. QA de conteúdo

Verificar:

- textos claros;
- sem termo técnico desnecessário;
- botão diz ação real;
- erro orienta;
- sucesso confirma;
- estado vazio sugere próximo passo;
- confirmação explica consequência.

## 9. QA de fluxo

Verificar:

- usuário sabe onde está;
- usuário sabe o que fazer;
- usuário sabe o que aconteceu;
- usuário consegue voltar;
- usuário consegue cancelar;
- usuário não perde dados sem aviso;
- usuário não executa ação perigosa por acidente.

## 10. Checklist antes de aprovar uma tela

A tela só está aprovada se:

- objetivo está claro;
- ação principal está clara;
- botões têm destino;
- estados existem;
- mobile foi considerado;
- erros foram considerados;
- permissões foram consideradas;
- textos são claros;
- componente é consistente;
- visual não está poluído.

## 11. Regra final

Se a tela só funciona no cenário perfeito, ela ainda não está pronta.
