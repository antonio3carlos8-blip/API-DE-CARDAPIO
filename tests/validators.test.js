import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { idParamSchema } from "../src/validators/comumValidator.js";
import {
  criarCardapioSchema,
  atualizarCardapioSchema,
} from "../src/validators/cardapioValidator.js";
import {
  criarCategoriaSchema,
  atualizarCategoriaSchema,
  filtrosCategoriaSchema,
} from "../src/validators/categoriaValidator.js";
import {
  criarProdutoSchema,
  atualizarProdutoSchema,
  filtrosProdutoSchema,
} from "../src/validators/produtoValidator.js";

describe("Backend Validators", () => {
  describe("idParamSchema", () => {
    it("accepts a valid UUID", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const result = idParamSchema.safeParse({ id: validUuid });
      assert.equal(result.success, true);
    });

    it("rejects an invalid UUID", () => {
      const result = idParamSchema.safeParse({ id: "invalid-id-123" });
      assert.equal(result.success, false);
      assert.equal(result.error.issues[0].message, "ID deve ser um UUID válido");
    });
  });

  describe("cardapioValidator", () => {
    it("validates valid criarCardapio input", () => {
      const result = criarCardapioSchema.safeParse({
        nome: "Cardápio de Verão",
        descricao: "Pratos leves e refrescantes",
        ativo: true,
      });
      assert.equal(result.success, true);
    });

    it("rejects empty nome in criarCardapio", () => {
      const result = criarCardapioSchema.safeParse({
        nome: "   ",
      });
      assert.equal(result.success, false);
    });

    it("converts empty string descricao to null in criarCardapio", () => {
      const result = criarCardapioSchema.safeParse({
        nome: "Cardápio Teste",
        descricao: "   ",
      });
      assert.equal(result.success, true);
      assert.equal(result.data.descricao, null);
    });

    it("accepts valid imagemUrl or converts empty string to null in criarCardapio", () => {
      const valid = criarCardapioSchema.safeParse({
        nome: "Cardápio Foto",
        imagemUrl: "https://example.com/foto.jpg",
      });
      assert.equal(valid.success, true);
      assert.equal(valid.data.imagemUrl, "https://example.com/foto.jpg");

      const empty = criarCardapioSchema.safeParse({
        nome: "Cardápio Sem Foto",
        imagemUrl: "",
      });
      assert.equal(empty.success, true);
      assert.equal(empty.data.imagemUrl, null);

      const invalid = criarCardapioSchema.safeParse({
        nome: "Cardápio URL Ruim",
        imagemUrl: "not-a-url",
      });
      assert.equal(invalid.success, false);
    });

    it("requires at least one field in atualizarCardapio", () => {
      const emptyResult = atualizarCardapioSchema.safeParse({});
      assert.equal(emptyResult.success, false);

      const validResult = atualizarCardapioSchema.safeParse({ nome: "Novo Nome" });
      assert.equal(validResult.success, true);
    });
  });

  describe("categoriaValidator", () => {
    const validCardapioId = "123e4567-e89b-12d3-a456-426614174000";

    it("validates valid criarCategoria input", () => {
      const result = criarCategoriaSchema.safeParse({
        nome: "Sobremesas",
        cardapioId: validCardapioId,
      });
      assert.equal(result.success, true);
    });

    it("rejects invalid cardapioId UUID", () => {
      const result = criarCategoriaSchema.safeParse({
        nome: "Sobremesas",
        cardapioId: "not-a-uuid",
      });
      assert.equal(result.success, false);
    });
  });

  describe("produtoValidator", () => {
    const validCategoriaId = "123e4567-e89b-12d3-a456-426614174000";

    it("validates valid criarProduto input", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Hambúrguer Smash",
        preco: 29.9,
        categoriaId: validCategoriaId,
        disponivel: true,
      });
      assert.equal(result.success, true);
      assert.equal(result.data.preco, 29.90);
    });

    it("rejects price coercion, excessive decimals and values above the database limit", () => {
      for (const preco of ["29.90", true, [29.9], 10.999, 100_000_000]) {
        const result = criarProdutoSchema.safeParse({
          nome: "Preço inválido",
          preco,
          categoriaId: validCategoriaId,
        });
        assert.equal(result.success, false, `deveria rejeitar ${JSON.stringify(preco)}`);
      }
    });

    it("accepts only http and https image URLs", () => {
      for (const imagemUrl of [
        "javascript:alert(1)",
        "data:image/svg+xml;base64,PHN2Zz4=",
        "ftp://example.com/foto.jpg",
      ]) {
        const result = criarProdutoSchema.safeParse({
          nome: "Imagem perigosa",
          preco: 10,
          imagemUrl,
          categoriaId: validCategoriaId,
        });
        assert.equal(result.success, false, `deveria rejeitar ${imagemUrl}`);
      }
    });

    it("rejects zero or negative price", () => {
      const zeroResult = criarProdutoSchema.safeParse({
        nome: "Item Grátis",
        preco: 0,
        categoriaId: validCategoriaId,
      });
      assert.equal(zeroResult.success, false);

      const negResult = criarProdutoSchema.safeParse({
        nome: "Item Negativo",
        preco: -10,
        categoriaId: validCategoriaId,
      });
      assert.equal(negResult.success, false);
    });

    it("accepts empty string for imagemUrl and converts to null", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Produto Sem Foto",
        preco: 15.0,
        imagemUrl: "",
        categoriaId: validCategoriaId,
      });
      assert.equal(result.success, true);
      assert.equal(result.data.imagemUrl, null);
    });

    it("converts empty string descricao to null in criarProduto", () => {
      const result = criarProdutoSchema.safeParse({
        nome: "Produto Sem Descrição",
        preco: 15.0,
        descricao: "   ",
        categoriaId: validCategoriaId,
      });
      assert.equal(result.success, true);
      assert.equal(result.data.descricao, null);
    });

    it("validates filtrosProdutoSchema with empty busca query gracefully", () => {
      const result = filtrosProdutoSchema.safeParse({
        busca: "",
        disponivel: "true",
      });
      assert.equal(result.success, true);
      assert.equal(result.data.busca, undefined);
      assert.equal(result.data.disponivel, true);
    });
  });
});
