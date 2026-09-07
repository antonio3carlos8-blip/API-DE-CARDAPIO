import BaseRepository from "./base/baseRepository.js";
import prisma from "../config/prisma.js";

class CategoriaRepository extends BaseRepository {
  constructor() {
    super(prisma.categoria);
  }

  async listarPorCardapio(cardapioId) {
    return this.modelo.findMany({
      where: { cardapioId },
      orderBy: { nome: "asc" },
    });
  }

  async buscarComProdutos(id) {
    return this.modelo.findUnique({
      where: { id },
      include: {
        produtos: true,
      },
    });
  }
}

export default new CategoriaRepository();
