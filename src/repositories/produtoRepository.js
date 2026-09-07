import BaseRepository from "./base/baseRepository.js";
import prisma from "../config/prisma.js";

class ProdutoRepository extends BaseRepository {
  constructor() {
    super(prisma.produto);
  }

  async listarComCategoria(filtros = {}) {
    const { categoriaId, disponivel, busca } = filtros;

    const where = {};

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (disponivel !== undefined) {
      where.disponivel = disponivel;
    }

    if (busca) {
      where.nome = { contains: busca, mode: "insensitive" };
    }

    return this.modelo.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: { nome: "asc" },
    });
  }

  async buscarComCategoria(id) {
    return this.modelo.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });
  }
}

export default new ProdutoRepository();
