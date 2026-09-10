# Cardápio Digital — API

API REST do Cardápio Digital, construída com Node.js 24, Express 5, Prisma 7 e PostgreSQL. Ela gerencia cardápios, categorias, produtos e pedidos, e protege todas as mutações administrativas com autenticação JWT.

## O que está implementado

- Catálogo público que expõe somente cardápios ativos.
- CRUD administrativo de cardápios, categorias e produtos.
- Preço validado como número finito, positivo, com até duas casas decimais e dentro de `DECIMAL(10,2)`.
- URLs de imagem limitadas a `http` e `https`.
- Pedidos persistidos com nome do cliente, observação, itens em snapshot, total calculado no servidor e chave de idempotência.
- Fila administrativa com estados `RECEBIDO`, `EM_PREPARO`, `PRONTO` e `CANCELADO`.
- Login administrativo, JWT de oito horas e rate limits.
- CORS por allowlist, Helmet, body de no máximo 1 MiB e erros HTTP normalizados.
- Liveness em `/health/live` e readiness com consulta à persistência em `/health` e `/health/ready`.
- Paginação opcional por `pagina` e `limite` (máximo 100).
- Seed idempotente com dois cardápios, seis categorias e 15 produtos; cada produto possui uma imagem própria.

## Rodar localmente

Requer Node.js 24+.

```bash
npm install
npm run dev
```

A API abre em `http://127.0.0.1:3001`. O comando padrão de desenvolvimento usa um armazenamento em memória com dados demonstrativos. Ele é deliberadamente proibido quando `NODE_ENV=production`; os dados reiniciam junto com o processo.

Para desenvolver contra PostgreSQL:

1. copie `.env.example` para `.env` e preencha apenas valores locais;
2. aplique as migrations com `npx prisma migrate deploy`;
3. execute `npm run dev:postgres`;
4. execute `npm.cmd run seed` para inserir ou atualizar os dois cardápios de exemplo.

Nunca use a antiga credencial de `.envExemple`; ela deve ser revogada no provedor.

## Scripts

| Comando | Resultado |
|---|---|
| `npm run dev` | API local com memória e hot reload |
| `npm run dev:postgres` | API local com PostgreSQL e hot reload |
| `npm start` | Runtime de produção, obrigatoriamente PostgreSQL |
| `npm test` | Suíte comportamental isolada |
| `npm run test:coverage` | Testes com cobertura nativa do Node |
| `npm run prisma:format` | Formata o schema sem abrir conexão |
| `npm run prisma:generate` | Regenera o Prisma Client sem abrir conexão |
| `npm run seed` | Insere ou atualiza 2 cardápios, 6 categorias e 15 produtos demonstrativos, sem apagar dados do usuário |

## Variáveis de produção

| Variável | Uso |
|---|---|
| `DATABASE_URL` | URL pooled usada pelo runtime |
| `DIRECT_URL` | URL direta usada exclusivamente pelo Prisma CLI/migrations |
| `DATABASE_POOL_SIZE` | Tamanho do pool por instância; padrão 3 |
| `CORS_ORIGIN` | Origens frontend permitidas, separadas por vírgula |
| `ADMIN_USERNAME` | Usuário administrativo; padrão `admin` |
| `ADMIN_PASSWORD` | Senha administrativa com ao menos 12 caracteres |
| `JWT_SECRET` | Segredo aleatório com ao menos 32 caracteres |

O processo falha fechado em produção se banco, CORS ou segredos administrativos estiverem ausentes ou fracos.

## Autenticação

`POST /api/auth/login` recebe:

```json
{ "usuario": "admin", "senha": "valor-configurado-no-ambiente" }
```

A resposta contém um token Bearer. O frontend oficial não o entrega ao JavaScript do navegador: seu BFF o mantém em cookie `HttpOnly` e encaminha o header somente para operações administrativas.

Todas as rotas `POST`, `PUT`, `PATCH` e `DELETE` de administração exigem `Authorization: Bearer <token>`. A criação pública de pedidos é a única mutação anônima e possui limite próprio.

## Principais rotas

| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/cardapios` | Público; somente ativos |
| `GET` | `/api/cardapios/:id` | Público se ativo; admin também vê inativo |
| `POST/PUT/DELETE` | `/api/cardapios...` | Admin |
| `GET` | `/api/categorias`, `/api/produtos` | Público |
| `POST/PUT/DELETE` | `/api/categorias...`, `/api/produtos...` | Admin |
| `POST` | `/api/pedidos` | Público, rate limited e idempotente |
| `GET` | `/api/pedidos` | Admin |
| `PATCH` | `/api/pedidos/:id/status` | Admin |

Na criação do pedido, o cliente envia apenas `cardapioId`, `chaveIdempotencia`, `clienteNome`, `observacao` opcional e pares `produtoId`/`quantidade`. Preço, subtotal e total são sempre obtidos e calculados novamente no servidor.

## Deploy

O procedimento mínimo e os únicos passos externos restantes estão em [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md). Não execute migration contra produção sem confirmar o alvo e um backup compatível.
