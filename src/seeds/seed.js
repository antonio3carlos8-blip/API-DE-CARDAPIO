import prisma from "../config/prisma.js";
import {
  CARDAPIOS_EXEMPLO,
  CATEGORIAS_EXEMPLO,
  PRODUTOS_EXEMPLO,
} from "./demoData.js";

// IDs fixos tornam o seed idempotente: uma nova execução atualiza os exemplos
// existentes, inclui os que faltam e não remove dados criados pelos usuários.
async function upsert(prismaModel, registro) {
  const { id, ...dados } = registro;
  return prismaModel.upsert({
    where: { id },
    update: dados,
    create: { id, ...dados },
  });
}

async function main() {
  console.log("Populando o banco com os cardápios de exemplo...");

  for (const cardapio of CARDAPIOS_EXEMPLO) {
    await upsert(prisma.cardapio, cardapio);
  }
  console.log(`  ${CARDAPIOS_EXEMPLO.length} cardápios`);

  for (const categoria of CATEGORIAS_EXEMPLO) {
    await upsert(prisma.categoria, categoria);
  }
  console.log(`  ${CATEGORIAS_EXEMPLO.length} categorias`);

  for (const produto of PRODUTOS_EXEMPLO) {
    await upsert(prisma.produto, produto);
  }
  console.log(`  ${PRODUTOS_EXEMPLO.length} produtos com imagens próprias`);

  console.log("Pronto.");
}

main()
  .catch((erro) => {
    console.error("Erro ao popular o banco:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
