# MARKETOPS

Sistema empresarial para atacado, com foco em gestao, estoque, vendas, caixas, PDV e evolucao futura para self-checkout.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Docker Compose
- PostgreSQL local para desenvolvimento

## Rodando com Docker

```bash
docker compose up --build
```

Acesse:

```txt
http://localhost:3000
```

O Compose sobe:

- `app`: aplicacao Next.js em modo desenvolvimento.
- `db`: PostgreSQL local para preparar a base do MVP 2.

## Comandos uteis

```bash
docker compose up --build
docker compose down
docker compose run --rm --no-deps app npm run lint
docker build --target builder -t marketops-build-check .
```

## Estrutura inicial

```txt
src/
  app/
  components/
    dashboard/
    layout/
    shared/
  lib/
```

## Proxima etapa

O MVP 1 agora deve evoluir para:

1. Navegacao real entre telas administrativas.
2. CRUD visual de secoes e categorias.
3. CRUD visual de produtos.
4. Tela inicial de estoque.
5. Tela inicial de caixas.
6. Preparacao de autenticacao e banco real.
