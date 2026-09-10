import BaseRepository from "./base/baseRepository.js";
import prisma from "../config/prisma.js";

class CategoriaRepository extends BaseRepository {
  constructor() {
    super(prisma.categoria);
  }

  async listarPorCardapio(cardapioId, paginacao = {}) {
    return this.modelo.findMany({
      where: { cardapioId },
      orderBy: { nome: "asc" },
      ...paginacao,
    });
  }

  async buscarComProdutos(id) {
    return this.modelo.findUnique({
      where: { id },
      include: {
        produtos: { orderBy: { nome: "asc" } },
        cardapio: true,
      },
    });
  }
}

export default new CategoriaRepository();
