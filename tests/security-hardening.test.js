process.env.NODE_ENV = "test";
process.env.DATA_STORE = "memory";
process.env.ADMIN_USERNAME = "admin-test";
process.env.ADMIN_PASSWORD = "senha-de-teste-nao-produtiva";
process.env.JWT_SECRET = "segredo-de-teste-com-mais-de-trinta-e-dois-caracteres";

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

describe("HTTP security hardening", () => {
  it("rejects an anonymous administrative mutation", async () => {
    const response = await request(app)
      .post("/api/cardapios")
      .send({ nome: "Não autorizado" });

    assert.equal(response.status, 401);
    assert.equal(response.body.erro, "Autenticação necessária");
  });

  it("authenticates the configured administrator without returning a cookie", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        usuario: "admin-test",
        senha: "senha-de-teste-nao-produtiva",
      });

    assert.equal(response.status, 200);
    assert.equal(typeof response.body.token, "string");
    assert.equal(response.body.usuario, "admin-test");
    assert.equal(response.headers["set-cookie"], undefined);
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"usuario":');

    assert.equal(response.status, 400);
    assert.equal(response.body.erro, "JSON inválido");
  });

  it("returns 413 when a JSON body exceeds one mebibyte", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ usuario: "a".repeat(1_100_000), senha: "x" });

    assert.equal(response.status, 413);
    assert.equal(response.body.erro, "Corpo da requisição muito grande");
  });

  it("does not authorize an unlisted browser origin", async () => {
    const response = await request(app)
      .options("/api/cardapios")
      .set("Origin", "https://origem-nao-autorizada.example")
      .set("Access-Control-Request-Method", "POST");

    assert.equal(response.headers["access-control-allow-origin"], undefined);
  });
});
