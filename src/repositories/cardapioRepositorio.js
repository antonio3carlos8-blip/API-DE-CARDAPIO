import BaseRepository from "./baseRepository.js";
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
          include: {
            produtos: true,
          },
        },
      },
    });
  }
}

export default new CardapioRepositorio();
