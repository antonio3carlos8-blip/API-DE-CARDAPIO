import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { emProducao, obterDatabaseUrl } from "./runtime.js";
import { criarPrismaEmMemoria } from "./memoryPrisma.js";

const dataStore = process.env.DATA_STORE || "postgres";

if (dataStore === "memory" && emProducao()) {
  throw new Error("DATA_STORE=memory não é permitido em produção");
}

if (!new Set(["postgres", "memory"]).has(dataStore)) {
  throw new Error("DATA_STORE deve ser postgres ou memory");
}

const criarPrismaPostgres = async () => {
  const { PrismaClient } = await import("@prisma/client");
  const adapter = new PrismaPg({
    connectionString: obterDatabaseUrl(),
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    max: Number(process.env.DATABASE_POOL_SIZE || 5),
  });
  return new PrismaClient({ adapter });
};

const prisma =
  dataStore === "memory"
    ? criarPrismaEmMemoria({ popular: process.env.NODE_ENV !== "test" })
    : await criarPrismaPostgres();

export default prisma;
