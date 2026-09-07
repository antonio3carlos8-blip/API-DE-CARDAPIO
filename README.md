# 🍔 Cardápio Digital — API

API REST para criação e gerenciamento de cardápios de restaurantes, lanchonetes e outros estabelecimentos alimentícios.

O sistema permite cadastrar, visualizar, atualizar e excluir produtos, além de organizar os itens por categorias como hambúrgueres, bebidas e sobremesas. Também é possível pesquisar e filtrar os produtos disponíveis no cardápio.

A aplicação é composta por um frontend, responsável pela interface do usuário, e esta API REST, responsável pelo gerenciamento dos dados e pela comunicação com o banco de dados. O projeto será disponibilizado em produção através da Vercel, integrando frontend, API e banco de dados.

## Funcionalidades

- [x] Cadastro de cardápios
- [x] Cadastro de categorias
- [x] Edição e exclusão de categorias
- [x] Cadastro de produtos
- [x] Edição e exclusão de produtos
- [x] Consulta e pesquisa de produtos
- [x] Filtro de produtos por categoria
- [x] Controle de disponibilidade dos produtos
- [x] Integração com banco de dados PostgreSQL
- [x] API REST documentada
- [ ] Montagem de um pedido
- [ ] Cálculo do valor total do pedido
- [ ] Deploy da aplicação em produção

## Tecnologias

| Ferramenta | Uso |
|---|---|
| Node.js | Runtime (ES Modules) |
| Express 5 | Servidor HTTP e roteamento |
| Prisma 7 | ORM e migrations |
| PostgreSQL | Banco de dados (Supabase) |
| Zod | Validação dos dados de entrada |
| dotenv | Variáveis de ambiente |
| nodemon | Reinício automático em desenvolvimento |

## Como rodar

**Pré-requisitos:** Node.js 20+ e um banco PostgreSQL.

**1. Instale as dependências**

```bash
npm install
```

**2. Configure o `.env`** na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/postgres"
DIRECT_URL="postgresql://usuario:senha@host:5432/postgres"
PORT=3000
```

`DATABASE_URL` é usada pela aplicação; `DIRECT_URL` é usada pelo CLI do Prisma nas migrations.

**3. Aplique as migrations**

```bash
npx prisma migrate deploy
```

**4. Popule o banco com dados de exemplo** (opcional)

```bash
npm run seed
```

**5. Suba o servidor**

```bash
npm run dev
```

A API sobe em `http://localhost:3000`.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor com reinício automático |
| `npm start` | Servidor em modo produção |
| `npm run seed` | Popula o banco com 1 cardápio, 4 categorias e 12 produtos |

## Estrutura do projeto

```
src/
  app.js               Monta a aplicação Express (middlewares e rotas)
  server.js            Sobe o servidor e trata o encerramento
  config/
    prisma.js          Cliente do Prisma com adapter do PostgreSQL
  routes/              Definição das rotas e validações de cada endpoint
  controllers/         Traduz HTTP para as chamadas de serviço
  services/            Regras de negócio
  repositories/        Acesso ao banco via Prisma
    base/              Repositório genérico herdado pelos demais
  validators/          Schemas de validação (Zod)
  middlewares/         Validação de entrada e tratamento de erros
  utils/               AppError
  seeds/               Script de povoamento do banco
prisma/
  schema.prisma        Modelagem do banco
  migrations/          Histórico de migrations
```

As camadas se comunicam sempre no mesmo sentido, cada uma conhecendo apenas a seguinte:

```
rota → controller → service → repository → banco
```

## Modelagem

```
Cardapio  1 ─── N  Categoria  1 ─── N  Produto
```

**Cardapio**

| Campo | Tipo | |
|---|---|---|
| `id` | UUID | gerado automaticamente |
| `nome` | string | obrigatório |
| `descricao` | string | opcional |
| `ativo` | boolean | padrão `true` |

**Categoria**

| Campo | Tipo | |
|---|---|---|
| `id` | UUID | gerado automaticamente |
| `nome` | string | obrigatório |
| `cardapioId` | UUID | obrigatório |

**Produto**

| Campo | Tipo | |
|---|---|---|
| `id` | UUID | gerado automaticamente |
| `nome` | string | obrigatório |
| `descricao` | string | opcional |
| `preco` | decimal(10,2) | obrigatório, maior que zero |
| `imagemUrl` | string | opcional, precisa ser uma URL |
| `disponivel` | boolean | padrão `true` |
| `categoriaId` | UUID | obrigatório |

Todos os registros têm `createdAt` e `updatedAt` preenchidos automaticamente.

---

# Documentação da API

**URL base:** `http://localhost:3000/api`

Todas as requisições e respostas usam JSON. Requisições com corpo precisam do cabeçalho `Content-Type: application/json`.

| Rota | Descrição |
|---|---|
| `GET /health` | Verifica se a API está no ar (fora da URL base) |
| `GET /api` | Nome, versão e recursos disponíveis |

## Cardápios

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/cardapios` | Cria um cardápio |
| `GET` | `/api/cardapios` | Lista todos |
| `GET` | `/api/cardapios/:id` | Busca um, com categorias e produtos aninhados |
| `PUT` | `/api/cardapios/:id` | Atualiza |
| `DELETE` | `/api/cardapios/:id` | Exclui |

**Criar**

```
POST /api/cardapios
```

```json
{
  "nome": "Cardápio Principal",
  "descricao": "Cardápio da hamburgueria",
  "ativo": true
}
```

Resposta `201 Created`:

```json
{
  "id": "a0000000-0000-4000-8000-000000000001",
  "nome": "Cardápio Principal",
  "descricao": "Cardápio da hamburgueria",
  "ativo": true,
  "createdAt": "2026-09-07T04:43:39.099Z",
  "updatedAt": "2026-09-07T04:43:39.099Z"
}
```

**Buscar por id** — retorna o cardápio completo, com as categorias e os produtos de cada uma:

```
GET /api/cardapios/a0000000-0000-4000-8000-000000000001
```

```json
{
  "id": "a0000000-0000-4000-8000-000000000001",
  "nome": "Cardápio Principal",
  "categorias": [
    {
      "id": "b0000000-0000-4000-8000-000000000001",
      "nome": "Hambúrgueres",
      "produtos": [
        { "id": "c0000000-0000-4000-8000-000000000001", "nome": "X-Salada" }
      ]
    }
  ]
}
```

**Regra:** um cardápio que possui categorias não pode ser excluído — retorna `409`.

## Categorias

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/categorias` | Cria uma categoria |
| `GET` | `/api/categorias` | Lista todas |
| `GET` | `/api/categorias/:id` | Busca uma, com seus produtos |
| `PUT` | `/api/categorias/:id` | Atualiza |
| `DELETE` | `/api/categorias/:id` | Exclui |

**Criar**

```
POST /api/categorias
```

```json
{
  "nome": "Hambúrgueres",
  "cardapioId": "a0000000-0000-4000-8000-000000000001"
}
```

O `cardapioId` precisa existir; caso contrário a resposta é `404`.

**Filtro na listagem**

| Parâmetro | Exemplo |
|---|---|
| `cardapioId` | `/api/categorias?cardapioId=a0000000-0000-4000-8000-000000000001` |

**Regra:** uma categoria que possui produtos não pode ser excluída — retorna `409`.

## Produtos

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/produtos` | Cria um produto |
| `GET` | `/api/produtos` | Lista todos, com filtros opcionais |
| `GET` | `/api/produtos/:id` | Busca um, com a categoria |
| `PUT` | `/api/produtos/:id` | Atualiza |
| `DELETE` | `/api/produtos/:id` | Exclui |

**Criar**

```
POST /api/produtos
```

```json
{
  "nome": "X-Bacon",
  "descricao": "Pão, hambúrguer 150g, queijo cheddar, bacon e cebola",
  "preco": 29.90,
  "imagemUrl": "https://exemplo.com/x-bacon.jpg",
  "disponivel": true,
  "categoriaId": "b0000000-0000-4000-8000-000000000001"
}
```

Resposta `201 Created`:

```json
{
  "id": "c0000000-0000-4000-8000-000000000002",
  "nome": "X-Bacon",
  "preco": 29.9,
  "disponivel": true,
  "categoriaId": "b0000000-0000-4000-8000-000000000001",
  "createdAt": "2026-09-07T04:43:39.397Z",
  "updatedAt": "2026-09-07T04:43:39.397Z"
}
```

A `categoriaId` precisa existir; caso contrário a resposta é `404`.

**Filtros na listagem** — podem ser combinados:

| Parâmetro | Valores | Exemplo |
|---|---|---|
| `categoriaId` | UUID | `/api/produtos?categoriaId=b0000000-0000-4000-8000-000000000003` |
| `disponivel` | `true` ou `false` | `/api/produtos?disponivel=false` |
| `busca` | texto | `/api/produtos?busca=burger` |

A busca é feita no nome do produto e ignora maiúsculas e minúsculas.

```
GET /api/produtos?categoriaId=b0000000-0000-4000-8000-000000000001&disponivel=true
```

**Atualizar** — envie apenas os campos que mudaram:

```json
{ "preco": 32.50, "disponivel": false }
```

## Códigos de status

| Código | Quando acontece |
|---|---|
| `200` | Requisição bem-sucedida |
| `201` | Registro criado |
| `204` | Registro excluído (sem corpo na resposta) |
| `400` | Dados inválidos — campo faltando, tipo errado ou UUID malformado |
| `404` | Registro não encontrado, ou rota inexistente |
| `409` | A operação conflita com o estado atual (exclusão com dependências) |
| `500` | Erro interno |

## Formato dos erros

Erros de validação trazem a lista de campos com problema:

```json
{
  "erro": "Dados inválidos",
  "detalhes": [
    { "campo": "nome", "mensagem": "Nome é obrigatório" },
    { "campo": "preco", "mensagem": "Preço deve ser maior que zero" }
  ]
}
```

Os demais erros trazem apenas a mensagem:

```json
{ "erro": "Produto não encontrado" }
```

## Regras de validação

**Cardápio**

| Campo | Regra |
|---|---|
| `nome` | obrigatório, 1 a 120 caracteres |
| `descricao` | opcional, até 500 caracteres |
| `ativo` | opcional, booleano |

**Categoria**

| Campo | Regra |
|---|---|
| `nome` | obrigatório, 1 a 120 caracteres |
| `cardapioId` | obrigatório, UUID de um cardápio existente |

**Produto**

| Campo | Regra |
|---|---|
| `nome` | obrigatório, 1 a 120 caracteres |
| `descricao` | opcional, até 500 caracteres |
| `preco` | obrigatório, número maior que zero |
| `imagemUrl` | opcional, URL válida |
| `disponivel` | opcional, booleano |
| `categoriaId` | obrigatório, UUID de uma categoria existente |

No `PUT` todos os campos são opcionais, mas ao menos um precisa ser enviado.

## Ordem de cadastro

Por causa das relações entre as tabelas, os registros precisam ser criados nesta ordem:

```
1. cardápio  →  2. categoria (precisa do cardapioId)  →  3. produto (precisa do categoriaId)
```
