# Planejamento de Banco, API e Backend

Este arquivo define como planejar a camada de dados e backend.

## Regra central

Backend não é apenas rota.
Backend é regra de negócio, segurança, validação, permissão, erro e consistência.

## Banco de dados

Antes de criar tabelas, identificar:

- entidades principais;
- relacionamentos;
- campos obrigatórios;
- campos opcionais;
- histórico;
- auditoria;
- soft delete;
- permissões;
- índices;
- constraints;
- dados sensíveis.

## Entidades

Para cada entidade, definir:

```md
## Entidade: Produto

Campos:
- id
- name
- sku
- price
- stock
- status
- created_at
- updated_at
- deleted_at, se houver soft delete

Relacionamentos:
- pertence a uma categoria
- pode aparecer em itens de venda

Regras:
- nome obrigatório
- preço não pode ser negativo
- estoque não pode ser negativo
- produto vendido não deve ser deletado fisicamente
```

## CRUD com responsabilidade

Nem todo CRUD deve ter delete físico.

Avaliar:

- pode excluir de verdade?
- precisa soft delete?
- existe histórico?
- há registros vinculados?
- quem pode excluir?
- precisa auditoria?

## API

Para cada módulo, planejar endpoints ou actions.

Exemplo:

| Método | Rota | Permissão | Função | Validação |
|---|---|---|---|---|
| GET | /products | autenticado | listar produtos | filtros opcionais |
| POST | /products | admin | criar produto | schema obrigatório |
| PATCH | /products/:id | admin | editar produto | schema parcial |
| DELETE | /products/:id | admin | soft delete | verificar vínculo |

## Validação

Sempre definir validação de entrada.

Preferir schemas explícitos com Zod, DTOs ou validação equivalente.

Validar:

- tipos;
- campos obrigatórios;
- tamanho mínimo/máximo;
- formatos;
- números negativos;
- IDs inválidos;
- enum/status;
- permissão;
- ownership.

## Tratamento de erro

Planejar respostas previsíveis:

- 400: entrada inválida;
- 401: não autenticado;
- 403: sem permissão;
- 404: recurso não encontrado;
- 409: conflito de regra;
- 500: erro interno.

Não vazar stack trace ao usuário final.

## Logs

Logs devem ajudar debug sem vazar dados sensíveis.

Registrar:

- erro técnico;
- request id;
- usuário, quando seguro;
- operação;
- módulo;
- timestamp.

Não registrar:

- senhas;
- tokens;
- API keys;
- dados bancários;
- documentos sensíveis sem necessidade.

## Permissões

Planejar por papéis:

| Papel | Pode ver | Pode criar | Pode editar | Pode excluir | Observação |
|---|---|---|---|---|---|
| Admin | tudo | sim | sim | sim | acesso completo |
| Operador | limitado | sim/não | limitado | não | depende do módulo |
| Cliente | próprios dados | limitado | próprios dados | não | precisa ownership |

## Supabase e RLS

Se usar Supabase:

- habilitar RLS em tabelas sensíveis;
- criar policies por papel/ownership;
- nunca usar service role no frontend;
- separar anon key de service role;
- validar regras também na API quando aplicável;
- testar acesso com usuários diferentes.

## Webhooks

Se houver webhooks:

- validar assinatura;
- registrar evento recebido;
- tornar idempotente;
- evitar processar duplicado;
- não confiar apenas no body;
- não executar ação sensível sem validação.

## Uploads

Se houver upload:

- validar tipo;
- validar tamanho;
- renomear arquivo;
- evitar path traversal;
- armazenar metadata;
- restringir acesso;
- usar URL assinada quando necessário.

## Critérios de backend pronto

Backend está minimamente pronto quando:

- entidades estão claras;
- schema/migration definido;
- validações existem;
- permissões existem;
- erros são previsíveis;
- fluxo principal funciona;
- dados sensíveis não vazam;
- testes manuais foram definidos.
