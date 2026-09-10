import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

const obterTokenAdmin = async () => {
  const login = await request(app)
    .post("/api/auth/login")
    .send({ usuario: "admin", senha: "admin" });
  assert.equal(login.status, 200);
  return login.body.token;
};

describe("Backend Routes & HTTP API Integration", () => {
  it("GET /health responds with 200 ok", async () => {
    const res = await request(app).get("/health");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });

  it("GET /api responds with 200 and API resource info", async () => {
    const res = await request(app).get("/api");
    assert.equal(res.status, 200);
    assert.equal(res.body.nome, "API de Cardápio Digital");
    assert.deepEqual(res.body.recursos, [
      "/cardapios",
      "/categorias",
      "/produtos",
      "/pedidos",
    ]);
  });

  it("GET /unknown responds with 404 rota não encontrada", async () => {
    const res = await request(app).get("/rota-inexistente-123");
    assert.equal(res.status, 404);
    assert.match(res.body.erro, /Rota não encontrada/);
  });

  it("POST /api/cardapios rejects empty body with 400", async () => {
    const token = await obterTokenAdmin();
    const res = await request(app)
      .post("/api/cardapios")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.erro, "Dados inválidos");
  });

  it("GET /api/cardapios/:id rejects non-UUID id with 400", async () => {
    const res = await request(app).get("/api/cardapios/not-a-valid-uuid");
    assert.equal(res.status, 400);
    assert.equal(res.body.erro, "Parâmetro inválido");
  });

  it("POST /api/produtos rejects negative price with 400", async () => {
    const token = await obterTokenAdmin();
    const res = await request(app).post("/api/produtos").send({
        nome: "Produto Teste",
        preco: -15,
        categoriaId: "123e4567-e89b-12d3-a456-426614174000",
      })
      .set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 400);
    assert.equal(res.body.erro, "Dados inválidos");
  });

  it("does not expose X-Powered-By header (security hardening)", async () => {
    const res = await request(app).get("/health");
    assert.equal(res.headers["x-powered-by"], undefined);
  });

  it("handles CORS headers on preflight OPTIONS request", async () => {
    const res = await request(app)
      .options("/api")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");
    assert.equal(res.status, 204);
    assert.equal(res.headers["access-control-allow-origin"], "http://localhost:3000");
  });
});
