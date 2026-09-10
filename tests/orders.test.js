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
  assert.equal(response.status, 200);
  return response.body.token;
};

const criarCatalogo = async () => {
  const token = await login();
  const autorizacao = { Authorization: `Bearer ${token}` };
  const cardapio = await request(app)
    .post("/api/cardapios")
    .set(autorizacao)
    .send({ nome: "Pedidos" });
  assert.equal(cardapio.status, 201);

  const categoria = await request(app)
    .post("/api/categorias")
    .set(autorizacao)
    .send({ nome: "Pratos", cardapioId: cardapio.body.id });
  assert.equal(categoria.status, 201);

  const produto = await request(app)
    .post("/api/produtos")
    .set(autorizacao)
    .send({
      nome: "Executivo",
      preco: 25.5,
      categoriaId: categoria.body.id,
    });
  assert.equal(produto.status, 201);

  return { token, cardapio: cardapio.body, produto: produto.body };
};

describe("Order flow", () => {
  it("creates a real order using server-side prices and exposes it only to admin", async () => {
    const { token, cardapio, produto } = await criarCatalogo();
    const criado = await request(app).post("/api/pedidos").send({
      cardapioId: cardapio.id,
      clienteNome: "Cliente Teste",
      chaveIdempotencia: "10000000-0000-4000-8000-000000000001",
      itens: [{ produtoId: produto.id, quantidade: 2 }],
    });

    assert.equal(criado.status, 201);
    assert.equal(criado.body.status, "RECEBIDO");
    assert.equal(criado.body.total, 51);
    assert.equal(criado.body.itens[0].nomeProduto, "Executivo");
    assert.equal(criado.body.itens[0].precoUnitario, 25.5);

    const anonimo = await request(app).get("/api/pedidos");
    assert.equal(anonimo.status, 401);

    const administrativo = await request(app)
      .get("/api/pedidos")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(administrativo.status, 200);
    assert.equal(administrativo.body.some((pedido) => pedido.id === criado.body.id), true);
  });

  it("rejects client-provided totals and unavailable products", async () => {
    const { token, cardapio, produto } = await criarCatalogo();

    const totalForjado = await request(app).post("/api/pedidos").send({
      cardapioId: cardapio.id,
      clienteNome: "Cliente Teste",
      chaveIdempotencia: "10000000-0000-4000-8000-000000000002",
      total: 0.01,
      itens: [{ produtoId: produto.id, quantidade: 1 }],
    });
    assert.equal(totalForjado.status, 400);

    await request(app)
      .put(`/api/produtos/${produto.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ disponivel: false });

    const indisponivel = await request(app).post("/api/pedidos").send({
      cardapioId: cardapio.id,
      clienteNome: "Cliente Teste",
      chaveIdempotencia: "10000000-0000-4000-8000-000000000003",
      itens: [{ produtoId: produto.id, quantidade: 1 }],
    });
    assert.equal(indisponivel.status, 409);
    assert.match(indisponivel.body.erro, /indisponível/i);
  });

  it("returns the same order for an idempotent retry and enforces status transitions", async () => {
    const { token, cardapio, produto } = await criarCatalogo();
    const payload = {
      cardapioId: cardapio.id,
      clienteNome: "Cliente Idempotente",
      chaveIdempotencia: "10000000-0000-4000-8000-000000000004",
      itens: [{ produtoId: produto.id, quantidade: 1 }],
    };
    const primeiro = await request(app).post("/api/pedidos").send(payload);
    const repetido = await request(app).post("/api/pedidos").send(payload);
    assert.equal(primeiro.status, 201);
    assert.equal(repetido.status, 201);
    assert.equal(repetido.body.id, primeiro.body.id);

    const chaveReutilizada = await request(app).post("/api/pedidos").send({
      ...payload,
      clienteNome: "Outro Cliente",
    });
    assert.equal(chaveReutilizada.status, 409);
    assert.match(chaveReutilizada.body.erro, /idempotência/i);

    const emPreparo = await request(app)
      .patch(`/api/pedidos/${primeiro.body.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "EM_PREPARO" });
    assert.equal(emPreparo.status, 200);

    const retrocesso = await request(app)
      .patch(`/api/pedidos/${primeiro.body.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "RECEBIDO" });
    assert.equal(retrocesso.status, 409);
  });
});
