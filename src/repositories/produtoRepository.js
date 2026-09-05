import { BaseRepository } from "./baseRepository.js";
import prisma from "../config/prisma.js";

class ProdutoRepository extends BaseRepository {
  constructor() {
    super(prisma.produto);
  }

  async listarComCategoria() {
    return this.modelo.findMany({
      include: {
        categoria: true,
      },
    });
  }
}

export default new ProdutoRepository();