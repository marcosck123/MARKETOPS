# Framework de Requisitos e Escopo

Este arquivo define como o agente deve entender requisitos antes de propor arquitetura.

## Regra central

Nunca planeje um sistema sem separar:

- problema;
- usuário;
- objetivo;
- fluxo;
- dados;
- permissões;
- módulos;
- restrições;
- MVP;
- futuro.

## Diagnóstico inicial

Ao receber uma ideia, identificar:

### 1. Problema real

Perguntar ou inferir com cuidado:

- Qual problema o sistema resolve?
- Esse problema é real ou apenas uma ideia visual?
- Quem sente esse problema?
- O que acontece se o sistema não existir?

### 2. Usuário principal

Mapear:

- administrador;
- funcionário;
- cliente;
- operador;
- visitante;
- vendedor;
- gerente;
- suporte;
- sistema externo;
- IA/agente.

Para cada usuário, definir:

- o que pode ver;
- o que pode criar;
- o que pode editar;
- o que pode excluir;
- quais telas acessa;
- quais ações são proibidas.

### 3. Ação principal

Toda aplicação precisa ter uma ação principal.

Exemplos:

- vender produto;
- cadastrar cliente;
- gerar proposta;
- consultar dados;
- enviar mensagem;
- controlar estoque;
- criar imóvel;
- processar pedido;
- acionar IA;
- registrar atendimento.

Se a ação principal não estiver clara, o projeto está imaturo.

## Classificação de requisitos

Classifique requisitos em:

### Essencial para MVP

Sem isso, o sistema não valida a ideia.

### Importante, mas fase 2

Ajuda o produto, mas pode esperar.

### Avançado/futuro

Só faz sentido depois de uso real.

### Excesso atual

Complica sem necessidade.

## Perguntas bloqueadoras

Antes de planejar arquitetura, perguntar quando faltar:

- Quem usa o sistema?
- Quais perfis existem?
- O usuário precisa login?
- Quais dados serão salvos?
- Existe pagamento?
- Existe upload?
- Existe integração externa?
- Existe painel admin?
- Existe app mobile?
- O sistema precisa funcionar offline?
- Existe multiempresa/multitenancy?
- Existe relatório?
- Existe auditoria?
- Existe regra sensível de permissão?

## Escopo proibido sem justificativa

Não incluir automaticamente:

- microserviços;
- app mobile;
- realtime;
- chatbot;
- IA;
- dashboard complexo;
- multiempresa;
- filas;
- Redis;
- Kubernetes;
- permissões granulares;
- analytics avançado;
- BI;
- automações;
- pagamentos;
- webhooks;
- notificações push.

Só incluir se o usuário pedir ou se for necessário para o objetivo.

## Matriz de escopo

Use esta tabela quando planejar:

| Item | Necessário para MVP? | Fase | Motivo | Risco |
|---|---|---|---|---|
| Login | Sim/Não | Fase 1 | ... | ... |
| Admin | Sim/Não | Fase 1/2 | ... | ... |
| Relatórios | Sim/Não | Fase 2 | ... | ... |
| Pagamento | Sim/Não | Fase 2/3 | ... | ... |
| IA | Sim/Não | Futuro | ... | ... |

## Critério de escopo fechado

O escopo está pronto quando for possível responder:

1. Quem usa?
2. O que faz?
3. Quais dados salva?
4. Quais telas existem?
5. Quais APIs existem?
6. Quem pode acessar o quê?
7. Como testa?
8. Como coloca no ar?
9. O que fica fora do MVP?

Se qualquer uma dessas respostas estiver muito vaga, o plano ainda não está pronto para Codex.
