# Framework de Decisão de Arquitetura

Este arquivo define como escolher arquitetura de forma crítica.

## Regra central

A arquitetura deve servir ao projeto.
O projeto não deve servir à arquitetura.

## Decisões obrigatórias

Antes de recomendar arquitetura, avaliar:

- tamanho do projeto;
- número de usuários;
- tipo de dados;
- necessidade de login;
- permissões;
- integrações;
- custo;
- prazo;
- equipe;
- manutenção;
- deploy;
- risco de segurança.

## Padrão recomendado por estágio

### Projeto pequeno ou portfólio

Preferir:

- Next.js full stack;
- Supabase ou PostgreSQL;
- API routes/server actions;
- autenticação simples;
- deploy na Vercel;
- storage simples.

Evitar:

- NestJS separado sem necessidade;
- microserviços;
- Redis;
- filas;
- Kubernetes;
- arquitetura distribuída.

### SaaS pequeno/médio

Preferir:

- Next.js frontend;
- backend separado se regras forem complexas;
- NestJS ou API Node organizada;
- PostgreSQL;
- Prisma;
- Supabase Auth/Clerk/Auth.js;
- storage R2/S3/Supabase Storage;
- deploy Vercel + Railway/Render/Fly.io.

### Sistema administrativo interno

Preferir:

- monolito modular;
- autenticação com roles;
- banco relacional;
- painel simples;
- logs básicos;
- deploy simples;
- backups.

### Sistema com automações ou IA

Preferir:

- separar execução de tarefas perigosas;
- filas/workers apenas se necessário;
- logs de auditoria;
- confirmação manual para comandos;
- limitação de permissões;
- isolamento entre frontend e execução local.

## Monolito modular

Use como padrão inicial.

Vantagens:

- mais simples;
- menor custo;
- menos deploys;
- menos falhas de integração;
- mais fácil de debugar;
- bom para MVP.

Desvantagens:

- pode ficar grande se não organizar;
- precisa modularização;
- pode exigir separação futura.

## Backend separado

Use quando:

- regras de negócio são complexas;
- várias interfaces consomem API;
- existe app mobile;
- integrações são pesadas;
- precisa controle maior de segurança;
- precisa separar deploy de frontend/backend.

Não use só porque parece mais profissional.

## Microserviços

Só considerar quando:

- equipe é grande;
- domínio é bem separado;
- existe escala real;
- serviços têm ciclo de vida independente;
- o custo operacional compensa.

Para MVP, quase sempre é excesso.

## Banco de dados

### PostgreSQL

Recomendado quando:

- existem relacionamentos;
- precisa consistência;
- dados estruturados;
- relatórios;
- permissões;
- histórico.

### Supabase

Bom quando:

- quer velocidade;
- precisa Auth + DB + Storage;
- projeto pequeno/médio;
- RLS é bem configurado;
- aceita trabalhar dentro do ecossistema.

Risco:

- RLS mal feita vaza dados;
- service role key no frontend é falha grave.

### MongoDB/NoSQL

Usar com cautela.

Faz sentido quando:

- dados são muito flexíveis;
- documentos variam bastante;
- não há muitas relações fortes.

Para sistemas administrativos comuns, PostgreSQL costuma ser melhor.

## Frontend

Escolha com base em:

- tipo de tela;
- complexidade de estado;
- SEO;
- necessidade de painel;
- integração com API;
- time.

Padrão forte:

- Next.js;
- TypeScript;
- Tailwind;
- shadcn/ui;
- React Hook Form;
- Zod.

Mas não adicionar tudo sem necessidade.

## Critério de decisão

Toda recomendação de stack deve responder:

- Por que essa stack?
- Qual problema ela resolve?
- Qual custo adiciona?
- Qual risco cria?
- Qual alternativa mais simples?
- Quando trocaríamos essa decisão?

## Modelo de decisão arquitetural

Use este formato:

```md
## Decisão
Usar Next.js + Supabase para o MVP.

## Motivo
Permite autenticação, banco e frontend com menor custo e velocidade alta.

## Alternativas consideradas
- Next.js + NestJS + PostgreSQL
- React + Express + PostgreSQL

## Por que não agora
Backend separado aumenta complexidade inicial sem necessidade.

## Riscos
RLS precisa ser bem configurado.
Service role key nunca pode ir para frontend.

## Quando evoluir
Se regras de negócio crescerem ou houver app mobile/API pública.
```

## Regra final

Arquitetura boa é aquela que o usuário consegue implementar, manter e colocar em produção sem se afogar em complexidade.
