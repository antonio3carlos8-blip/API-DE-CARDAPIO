import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";
import { obterConfiguracaoAdmin, obterHost } from "./config/runtime.js";

const PORTA = process.env.PORT || 3001;
const HOST = obterHost();

obterConfiguracaoAdmin();
await prisma.$connect();

const servidor = app.listen(PORTA, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORTA}`);
});

const encerrar = async (sinal) => {
  console.log(`\n${sinal} recebido, encerrando...`);
  servidor.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => encerrar("SIGINT"));
process.on("SIGTERM", () => encerrar("SIGTERM"));
