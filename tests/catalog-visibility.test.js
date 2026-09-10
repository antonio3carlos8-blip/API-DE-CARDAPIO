process.env.NODE_ENV = "test";
process.env.DATA_STORE = "memory";

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

const login = async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ usuario: "admin", senha: "admin" });
  return response.body.token;
};

describe("Public catalog visibility and pagination", () => {
  it("hides inactive menus from anonymous list and direct access", async () => {
    const token = await login();
    const criado = await request(app)
      .post("/api/cardapios")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Rascunho", ativo: false });
    assert.equal(criado.status, 201);

    const listaPublica = await request(app).get("/api/cardapios");
    assert.equal(listaPublica.body.some((item) => item.id === criado.body.id), false);

    const detalhePublico = await request(app).get(`/api/cardapios/${criado.body.id}`);
    assert.equal(detalhePublico.status, 404);

    const detalheAdmin = await request(app)
      .get(`/api/cardapios/${criado.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    assert.equal(detalheAdmin.status, 200);

    const categoria = await request(app)
      .post("/api/categorias")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Secreta", cardapioId: criado.body.id });
    const produto = await request(app)
      .post("/api/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Produto secreto", preco: 10, categoriaId: categoria.body.id });

    assert.equal((await request(app).get(`/api/categorias/${categoria.body.id}`)).status, 404);
    assert.equal((await request(app).get(`/api/produtos/${produto.body.id}`)).status, 404);
    const produtosPublicos = await request(app).get("/api/produtos?pagina=1&limite=100");
    assert.equal(produtosPublicos.body.some((item) => item.id === produto.body.id), false);
  });

  it("limits public menu pages while authenticated admin can list inactive menus", async () => {
    const token = await login();
    for (const nome of ["Ativo A", "Ativo B"]) {
      const criado = await request(app)
        .post("/api/cardapios")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome });
      assert.equal(criado.status, 201);
    }

    const pagina = await request(app).get("/api/cardapios?pagina=1&limite=1");
    assert.equal(pagina.status, 200);
    assert.equal(pagina.body.length, 1);

    const listaAdmin = await request(app)
      .get("/api/cardapios?pagina=1&limite=100")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(listaAdmin.status, 200);
    assert.equal(listaAdmin.body.some((item) => item.ativo === false), true);
  });
});
