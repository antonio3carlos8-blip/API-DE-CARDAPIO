import BaseRepository from "./base/baseRepository.js";
import prisma from "../config/prisma.js";

class CardapioRepositorio extends BaseRepository {
  constructor() {
    super(prisma.cardapio);
  }

  async buscarComCategorias(id) {
    return this.modelo.findUnique({
      where: { id },
      include: {
        categorias: {
          orderBy: { nome: "asc" },
          include: {
            produtos: { orderBy: { nome: "asc" } },
          },
        },
      },
    });
  }
}

export default new CardapioRepositorio();
