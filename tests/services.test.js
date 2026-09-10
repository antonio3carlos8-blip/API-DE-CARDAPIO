import { describe, it } from "node:test";
import assert from "node:assert/strict";

import cardapioServices from "../src/services/cardapioServices.js";
import categoriaServices from "../src/services/categoriaServices.js";
import produtoServices from "../src/services/produtoServices.js";
import cardapioRepositorio from "../src/repositories/cardapioRepositorio.js";
import categoriaRepository from "../src/repositories/categoriaRepository.js";
import produtoRepository from "../src/repositories/produtoRepository.js";
import AppError from "../src/utils/AppError.js";

describe("Backend Services", () => {
  describe("CardapioServices", () => {
    it("throws 404 if cardápio is not found", async () => {
      const original = cardapioRepositorio.buscarComCategorias;
      cardapioRepositorio.buscarComCategorias = async () => null;

      try {
        await assert.rejects(
          async () => cardapioServices.buscarPorId("non-existent-id"),
          (err) => {
            assert.equal(err instanceof AppError, true);
            assert.equal(err.status, 404);
            assert.equal(err.message, "Cardápio não encontrado");
            return true;
          }
        );
      } finally {
        cardapioRepositorio.buscarComCategorias = original;
      }
    });

    it("formats nested product prices as numbers", async () => {
      const original = cardapioRepositorio.buscarComCategorias;
      cardapioRepositorio.buscarComCategorias = async () => ({
        id: "c1",
        nome: "Cardápio Principal",
        categorias: [
          {
            id: "cat1",
            nome: "Bebidas",
            produtos: [
              { id: "p1", nome: "Suco", preco: "12.50" },
              { id: "p2", nome: "Refrigerante", preco: 8.0 },
            ],
          },
        ],
      });

      try {
        const resultado = await cardapioServices.buscarPorId("c1");
        assert.equal(resultado.categorias[0].produtos[0].preco, 12.5);
        assert.equal(typeof resultado.categorias[0].produtos[0].preco, "number");
        assert.equal(resultado.categorias[0].produtos[1].preco, 8.0);
      } finally {
        cardapioRepositorio.buscarComCategorias = original;
      }
    });

    it("blocks exclusion when cardapio has categories (409)", async () => {
      const original = cardapioRepositorio.buscarComCategorias;
      cardapioRepositorio.buscarComCategorias = async () => ({
        id: "c1",
        categorias: [{ id: "cat-1" }],
      });

      try {
        await assert.rejects(
          async () => cardapioServices.excluir("c1"),
          (err) => {
            assert.equal(err instanceof AppError, true);
            assert.equal(err.status, 409);
            assert.match(err.message, /possui categorias/);
            return true;
          }
        );
      } finally {
        cardapioRepositorio.buscarComCategorias = original;
      }
    });
  });

  describe("CategoriaServices", () => {
    it("blocks exclusion when categoria has products (409)", async () => {
      const original = categoriaRepository.buscarComProdutos;
      categoriaRepository.buscarComProdutos = async () => ({
        id: "cat1",
        produtos: [{ id: "prod-1" }],
      });

      try {
        await assert.rejects(
          async () => categoriaServices.excluir("cat1"),
          (err) => {
            assert.equal(err instanceof AppError, true);
            assert.equal(err.status, 409);
            assert.match(err.message, /possui produtos/);
            return true;
          }
        );
      } finally {
        categoriaRepository.buscarComProdutos = original;
      }
    });
  });

  describe("ProdutoServices", () => {
    it("formats product preco as number", async () => {
      const original = produtoRepository.buscarComCategoria;
      produtoRepository.buscarComCategoria = async () => ({
        id: "p1",
        nome: "Pizza",
        preco: "49.90",
      });

      try {
        const resultado = await produtoServices.buscarPorId("p1");
        assert.equal(resultado.preco, 49.9);
        assert.equal(typeof resultado.preco, "number");
      } finally {
        produtoRepository.buscarComCategoria = original;
      }
    });
  });
});
