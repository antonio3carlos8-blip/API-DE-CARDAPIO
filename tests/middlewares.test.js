process.env.NODE_ENV = "test";

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";

import {
  validarCorpo,
  validarParams,
  validarQuery,
} from "../src/middlewares/validar.js";
import {
  tratadorDeErros,
  rotaNaoEncontrada,
} from "../src/middlewares/tratadorDeErros.js";
import AppError from "../src/utils/AppError.js";

describe("Backend Middlewares", () => {
  describe("validarCorpo", () => {
    const schema = z.object({ nome: z.string().min(2) });

    it("passes validated body to next middleware", () => {
      let nextCalled = false;
      const req = { body: { nome: "Lasanha" } };
      const res = {};
      const next = () => { nextCalled = true; };

      validarCorpo(schema)(req, res, next);
      assert.equal(nextCalled, true);
      assert.equal(req.body.nome, "Lasanha");
    });

    it("returns 400 when body validation fails", () => {
      let status = 0;
      let jsonResponse = null;
      const req = { body: { nome: "A" } };
      const res = {
        status: (s) => {
          status = s;
          return {
            json: (j) => { jsonResponse = j; },
          };
        },
      };
      const next = () => {};

      validarCorpo(schema)(req, res, next);
      assert.equal(status, 400);
      assert.equal(jsonResponse.erro, "Dados inválidos");
      assert.equal(Array.isArray(jsonResponse.detalhes), true);
    });
  });

  describe("validarParams", () => {
    const schema = z.object({ id: z.string().min(5) });

    it("returns 400 when param is invalid", () => {
      let status = 0;
      let jsonResponse = null;
      const req = { params: { id: "1" } };
      const res = {
        status: (s) => {
          status = s;
          return {
            json: (j) => { jsonResponse = j; },
          };
        },
      };

      validarParams(schema)(req, res, () => {});
      assert.equal(status, 400);
      assert.equal(jsonResponse.erro, "Parâmetro inválido");
    });
  });

  describe("tratadorDeErros", () => {
    it("handles AppError correctly", () => {
      let status = 0;
      let jsonResponse = null;
      const res = {
        headersSent: false,
        status: (s) => {
          status = s;
          return { json: (j) => { jsonResponse = j; } };
        },
      };

      const erro = new AppError("Cardápio não encontrado", 404);
      tratadorDeErros(erro, {}, res, () => {});

      assert.equal(status, 404);
      assert.equal(jsonResponse.erro, "Cardápio não encontrado");
    });

    it("maps Prisma P2002 to 409 conflict", () => {
      let status = 0;
      let jsonResponse = null;
      const res = {
        headersSent: false,
        status: (s) => {
          status = s;
          return { json: (j) => { jsonResponse = j; } };
        },
      };

      const erroPrisma = { code: "P2002" };
      tratadorDeErros(erroPrisma, {}, res, () => {});

      assert.equal(status, 409);
      assert.equal(jsonResponse.erro, "Registro duplicado");
    });

    it("maps Prisma P2025 to 404 not found", () => {
      let status = 0;
      let jsonResponse = null;
      const res = {
        headersSent: false,
        status: (s) => {
          status = s;
          return { json: (j) => { jsonResponse = j; } };
        },
      };

      const erroPrisma = { code: "P2025" };
      tratadorDeErros(erroPrisma, {}, res, () => {});

      assert.equal(status, 404);
      assert.equal(jsonResponse.erro, "Registro não encontrado");
    });

    it("handles generic unexpected errors with 500 status", () => {
      let status = 0;
      let jsonResponse = null;
      const res = {
        headersSent: false,
        status: (s) => {
          status = s;
          return { json: (j) => { jsonResponse = j; } };
        },
      };

      const err = new Error("Database crashed");
      tratadorDeErros(err, {}, res, () => {});

      assert.equal(status, 500);
      assert.equal(jsonResponse.erro, "Erro interno do servidor");
    });

    it("maps unavailable database connections to 503", () => {
      let status = 0;
      let jsonResponse = null;
      const res = {
        headersSent: false,
        status: (s) => {
          status = s;
          return { json: (j) => { jsonResponse = j; } };
        },
      };

      tratadorDeErros({ code: "ECONNREFUSED" }, {}, res, () => {});

      assert.equal(status, 503);
      assert.equal(jsonResponse.erro, "Serviço de dados indisponível");
    });
  });

  describe("rotaNaoEncontrada", () => {
    it("returns 404 with route description", () => {
      let status = 0;
      let jsonResponse = null;
      const req = { method: "GET", originalUrl: "/api/desconhecida" };
      const res = {
        status: (s) => {
          status = s;
          return { json: (j) => { jsonResponse = j; } };
        },
      };

      rotaNaoEncontrada(req, res);
      assert.equal(status, 404);
      assert.equal(jsonResponse.erro, "Rota não encontrada: GET /api/desconhecida");
    });
  });
});
