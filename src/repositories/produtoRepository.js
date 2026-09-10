import BaseRepository from "./base/baseRepository.js";
import prisma from "../config/prisma.js";

class ProdutoRepository extends BaseRepository {
  constructor() {
    super(prisma.produto);
  }

  async listarComCategoria(filtros = {}, incluirInativos = false) {
    const { categoriaId, disponivel, busca, skip, take } = filtros;

    const where = {};

    if (!incluirInativos) {
      where.categoria = { cardapio: { ativo: true } };
    }

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
        categoria: { include: { cardapio: true } },
      },
      orderBy: { nome: "asc" },
      skip,
      take,
    });
  }

  async buscarComCategoria(id) {
    return this.modelo.findUnique({
      where: { id },
      include: {
        categoria: { include: { cardapio: true } },
      },
    });
  }
}

export default new ProdutoRepository();
