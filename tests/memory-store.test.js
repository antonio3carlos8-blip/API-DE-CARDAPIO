import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { criarPrismaEmMemoria } from "../src/config/memoryPrisma.js";

describe("Local in-memory data store", () => {
  it("supports the relational CRUD shape used by the repositories", async () => {
    const prisma = criarPrismaEmMemoria({ popular: false });
    const cardapio = await prisma.cardapio.create({ data: { nome: "Teste" } });
    const categoria = await prisma.categoria.create({
      data: { nome: "Bebidas", cardapioId: cardapio.id },
    });
    await prisma.produto.create({
      data: {
        nome: "Suco",
        preco: 12.5,
        categoriaId: categoria.id,
      },
    });

    const completo = await prisma.cardapio.findUnique({
      where: { id: cardapio.id },
      include: { categorias: { include: { produtos: true } } },
    });

    assert.equal(completo.categorias.length, 1);
    assert.equal(completo.categorias[0].produtos[0].nome, "Suco");
    assert.equal(completo.categorias[0].produtos[0].preco, 12.5);
  });

  it("provides seeded data and a successful readiness probe", async () => {
    const prisma = criarPrismaEmMemoria();
    const cardapios = await prisma.cardapio.findMany({
      include: { categorias: { include: { produtos: true } } },
    });
    const produtos = cardapios.flatMap((cardapio) =>
      cardapio.categorias.flatMap((categoria) => categoria.produtos),
    );
    const imagens = produtos.map((produto) => produto.imagemUrl);

    assert.equal(cardapios.length, 2);
    assert.equal(produtos.length >= 15, true);
    assert.equal(imagens.every((imagem) => /^https:\/\//.test(imagem)), true);
    assert.equal(new Set(imagens).size, produtos.length);
    assert.deepEqual(await prisma.$queryRawUnsafe("SELECT 1"), [{ result: 1 }]);
  });
});
