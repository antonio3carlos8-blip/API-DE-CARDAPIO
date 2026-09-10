# Checklist de deploy na Vercel

Estes são os passos externos que Antônio ainda precisa executar. O código não contém valores reais de credenciais.

## 1. Revogar o segredo antigo

Antes do primeiro deploy, revogue ou rotacione no Supabase a credencial que apareceu historicamente em `.envExemple`. Depois, reescreva o histórico Git com uma ferramenta apropriada, coordene o force-push com quem usa o repositório e confirme que o job Gitleaks fica verde. Excluir apenas o arquivo atual não revoga a senha nem apaga commits antigos.

## 2. Preparar PostgreSQL/Supabase

- Use a URL pooled em `DATABASE_URL` para o runtime.
- Use a URL direta em `DIRECT_URL` apenas para migrations.
- Confirme que o alvo não é um banco de terceiros e que existe backup/restauração compatível.
- Execute, a partir do backend, `npx.cmd prisma migrate deploy`.
- Confirme `npx.cmd prisma migrate status`.
- Execute `npm.cmd run seed` uma vez para inserir ou atualizar os dois cardápios e os 15 produtos de exemplo.
- Faça um CRUD/pedido de smoke test.

A migration de pedidos é aditiva: cria o enum `PedidoStatus`, as tabelas `pedidos`/`pedido_itens`, índices, FKs e checks. O rollback preferencial é voltar o código e preservar as tabelas; remover as tabelas apagaria pedidos e exige decisão explícita.

## 3. Projeto backend na Vercel

Cadastre o repositório `API-DE-CARDAPIO`, runtime Node.js 24 e estas variáveis nos ambientes desejados:

- `DATABASE_URL`
- `DIRECT_URL`
- `DATABASE_POOL_SIZE=3` (reduza se o pooler exigir)
- `CORS_ORIGIN=https://URL-FINAL-DO-FRONTEND`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD` com ao menos 12 caracteres
- `JWT_SECRET` aleatório com ao menos 32 caracteres

Não cadastre `DATA_STORE=memory`. Verifique `/health/live`, `/health` e um `GET /api/cardapios`. A detecção zero-config da Vercel usa o `export default app` do Express; não é necessário adicionar `vercel.json` apenas para isso.

## 4. Projeto frontend na Vercel

Cadastre o repositório `API-DE-CARDAPIO-FRONTEND`, runtime Node.js 24 e somente:

- `API_URL=https://URL-FINAL-DO-BACKEND/api`

Não use prefixo `NEXT_PUBLIC_` e não copie senha/JWT para o frontend. Depois do domínio final existir, confirme que ele está exatamente em `CORS_ORIGIN` do backend e faça redeploy do backend se a variável mudou.

## 5. Smoke test final

1. abra o catálogo público em janela anônima;
2. confirme que rascunhos não aparecem nem abrem por URL direta;
3. monte e envie um pedido e anote o identificador retornado;
4. entre em `/admin/login`, encontre o pedido e avance `Recebido → Em preparo → Pronto`;
5. confirme que anônimo recebe `401` ao tentar mutações administrativas;
6. confirme que origem fora de `CORS_ORIGIN` não recebe o header de permissão;
7. acompanhe logs e conexões do banco durante o primeiro tráfego.

Somente após esses sete pontos, migrations e Gitleaks verdes o ambiente deve ser tratado como produção liberada.
