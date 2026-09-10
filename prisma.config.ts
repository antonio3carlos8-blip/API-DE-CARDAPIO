import "dotenv/config";
import { defineConfig } from "prisma/config";

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const apenasGeracao = process.env.PRISMA_SCHEMA_ONLY === "true";

if (!dbUrl && !apenasGeracao) {
  throw new Error(
    "Defina DIRECT_URL ou DATABASE_URL para comandos de banco do Prisma"
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // O placeholder só permite format/generate sem conexão. Runtime e migrations
    // continuam falhando sem uma URL explícita.
    url: dbUrl || "postgresql://schema:only@127.0.0.1:1/schema_only",
  },
});
