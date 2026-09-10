-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('RECEBIDO', 'EM_PREPARO', 'PRONTO', 'CANCELADO');

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "chave_idempotencia" TEXT NOT NULL,
    "cliente_nome" TEXT NOT NULL,
    "observacao" TEXT,
    "status" "PedidoStatus" NOT NULL DEFAULT 'RECEBIDO',
    "total" DECIMAL(10,2) NOT NULL,
    "cardapio_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" TEXT NOT NULL,
    "nome_produto" TEXT NOT NULL,
    "preco_unitario" DECIMAL(10,2) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "produto_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedidos_cardapio_id_idx" ON "pedidos"("cardapio_id");

-- CreateIndex
CREATE INDEX "pedidos_status_created_at_idx" ON "pedidos"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_chave_idempotencia_key" ON "pedidos"("chave_idempotencia");

-- CreateIndex
CREATE INDEX "pedido_itens_pedido_id_idx" ON "pedido_itens"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_itens_produto_id_idx" ON "pedido_itens"("produto_id");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cardapio_id_fkey" FOREIGN KEY ("cardapio_id") REFERENCES "cardapios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CheckConstraints
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_quantidade_check" CHECK ("quantidade" BETWEEN 1 AND 20);
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_valores_check" CHECK ("preco_unitario" > 0 AND "subtotal" > 0);
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_total_check" CHECK ("total" > 0);
