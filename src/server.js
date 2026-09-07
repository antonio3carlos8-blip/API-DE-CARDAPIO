import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";

const PORTA = process.env.PORT || 3000;

const servidor = app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
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
