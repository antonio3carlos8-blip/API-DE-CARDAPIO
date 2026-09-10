import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  obterConfiguracaoAdmin,
  obterDatabaseUrl,
  obterOrigensPermitidas,
} from "../src/config/runtime.js";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("Production configuration", () => {
  it("fails closed without database, CORS and strong admin secrets", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.CORS_ORIGIN;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.JWT_SECRET;

    assert.throws(obterDatabaseUrl, /DATABASE_URL/);
    assert.throws(obterOrigensPermitidas, /CORS_ORIGIN/);
    assert.throws(obterConfiguracaoAdmin, /ADMIN_PASSWORD/);
  });

  it("accepts explicit production values", () => {
    process.env.NODE_ENV = "production";
    process.env.DATABASE_URL = "postgresql://example.invalid/database";
    process.env.CORS_ORIGIN = "https://cardapio.example";
    process.env.ADMIN_PASSWORD = "uma-senha-comprida";
    process.env.JWT_SECRET = "um-segredo-de-jwt-com-mais-de-trinta-e-dois-caracteres";

    assert.equal(obterDatabaseUrl(), process.env.DATABASE_URL);
    assert.deepEqual(obterOrigensPermitidas(), ["https://cardapio.example"]);
    assert.equal(obterConfiguracaoAdmin().usuario, "admin");
  });

  it("rejects wildcard and malformed CORS origins", () => {
    process.env.NODE_ENV = "production";
    for (const origem of ["*", "javascript:alert(1)", "https://example.com/caminho"]) {
      process.env.CORS_ORIGIN = origem;
      assert.throws(obterOrigensPermitidas, /CORS_ORIGIN/);
    }
  });
});
