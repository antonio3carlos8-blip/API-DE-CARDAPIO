import prisma from "../config/prisma.js";

class PedidoRepository {
  async criar(dados) {
    return prisma.pedido.create({ data: dados, include: { itens: true } });
  }

  async listar() {
    return prisma.pedido.findMany({
      include: { itens: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async buscarPorId(id) {
    return prisma.pedido.findUnique({
      where: { id },
      include: { itens: true },
    });
  }

  async buscarPorChave(chaveIdempotencia) {
    return prisma.pedido.findUnique({
      where: { chaveIdempotencia },
      include: { itens: true },
    });
  }

  async atualizarStatus(id, status) {
    return prisma.pedido.update({
      where: { id },
      data: { status },
      include: { itens: true },
    });
  }
}

export default new PedidoRepository();
