# Segurança, Deploy e QA

Este arquivo define o checklist obrigatório antes de considerar um plano pronto para implementação ou produção.

## Segurança

### Secrets

Nunca expor no frontend:

- service role key;
- database URL com senha;
- API key privada;
- token de webhook;
- chave de pagamento;
- credenciais de SMTP;
- tokens de IA privados.

Usar variáveis de ambiente no backend/servidor.

### Autenticação

Verificar:

- login;
- logout;
- recuperação de senha;
- sessão persistente;
- expiração de sessão;
- proteção de rotas;
- middleware;
- redirecionamento de usuário não autenticado.

### Autorização

Autenticação responde: quem é você?
Autorização responde: o que você pode fazer?

Planejar:

- roles;
- permissões;
- ownership;
- admin;
- operador;
- cliente;
- acesso a dados próprios;
- bloqueio de ações sensíveis.

Não confiar apenas em esconder botão no frontend.

### Validação

Validar tudo que entra:

- body;
- query params;
- route params;
- arquivos;
- webhooks;
- comandos;
- URLs;
- IDs.

### Riscos comuns

Avaliar:

- SQL Injection;
- XSS;
- CSRF;
- Command Injection;
- Path Traversal;
- IDOR;
- CORS mal configurado;
- upload inseguro;
- logs com dados sensíveis;
- rate limiting ausente.

## Deploy

### Ambientes

Planejar:

- local;
- development;
- staging, se necessário;
- production.

Separar variáveis por ambiente.

### Checklist de deploy

Antes de deploy:

- build passa;
- lint passa, se existir;
- migrations aplicadas;
- variáveis configuradas;
- domínio configurado;
- HTTPS ativo;
- auth callback URLs configuradas;
- storage configurado;
- backups configurados;
- logs básicos disponíveis.

### Stack de deploy comum

Para projetos Next:

- frontend: Vercel;
- banco: Supabase/Neon/RDS;
- backend separado: Railway/Render/Fly.io/AWS;
- storage: Supabase Storage/R2/S3;
- email: Resend/SendGrid;
- logs: plataforma + Sentry, se necessário.

Não recomendar infra complexa sem necessidade.

## QA

### Testes manuais obrigatórios

Para cada fluxo principal:

- usuário consegue executar ação principal;
- formulário valida campos;
- erro aparece corretamente;
- loading aparece;
- lista vazia aparece;
- permissão bloqueia corretamente;
- refresh não quebra sessão;
- mobile básico funciona.

### Testes por perfil

Testar:

- admin;
- operador;
- usuário comum;
- não autenticado;
- usuário sem permissão.

### Critérios de aceite

Cada entrega deve ter critérios objetivos.

Exemplo:

```md
Critérios de aceite:
- Admin cria produto com nome, preço e estoque.
- Operador visualiza produtos, mas não vê botão de excluir.
- Excluir produto abre confirmação.
- Produto excluído aplica soft delete.
- Produto excluído não aparece na listagem padrão.
- Erro de validação aparece abaixo do campo.
```

## Auditoria e logs

Para ações críticas, considerar auditoria:

- criar;
- editar;
- excluir;
- login;
- alteração de permissão;
- pagamento;
- exportação;
- comando executado;
- alteração de configuração.

## Backups

Para projetos com dados reais:

- backup do banco;
- política de retenção;
- teste de restauração;
- backup de arquivos, se necessário.

## Checklist antes de produção

- [ ] Variáveis sensíveis fora do frontend
- [ ] Autenticação configurada
- [ ] Autorização no backend/banco
- [ ] RLS testada, se usar Supabase
- [ ] Validação de entrada
- [ ] Tratamento de erro
- [ ] Logs sem secrets
- [ ] Rate limiting, quando necessário
- [ ] Upload seguro, quando houver
- [ ] Backup configurado
- [ ] Deploy testado
- [ ] Fluxos principais testados
- [ ] Usuários sem permissão bloqueados
- [ ] Documentação mínima criada

## Regra final

Funcionar localmente não significa estar pronto para produção.
