import prisma from "../config/prisma.js";
import pedidoRepository from "../repositories/pedidoRepository.js";
import AppError from "../utils/AppError.js";

const formatar = (pedido) =>
  pedido && {
    ...pedido,
    total: Number(pedido.total),
    itens: pedido.itens?.map((item) => ({
      ...item,
      precoUnitario: Number(item.precoUnitario),
      subtotal: Number(item.subtotal),
    })),
  };

const pedidoCorresponde = (pedido, dados) => {
  if (
    pedido.cardapioId !== dados.cardapioId ||
    pedido.clienteNome !== dados.clienteNome ||
    (pedido.observacao ?? null) !== (dados.observacao ?? null) ||
    pedido.itens?.length !== dados.itens.length
  ) {
    return false;
  }

  const quantidades = new Map(
    pedido.itens.map((item) => [item.produtoId, item.quantidade])
  );
  return dados.itens.every(
    (item) => quantidades.get(item.produtoId) === item.quantidade
  );
};

const validarRepeticao = (pedido, dados) => {
  if (!pedidoCorresponde(pedido, dados)) {
    throw new AppError(
      "Chave de idempotência já usada para outro pedido",
      409
    );
  }
  return formatar(pedido);
};

class PedidoServices {
  async criar(dados) {
    const existente = await pedidoRepository.buscarPorChave(dados.chaveIdempotencia);
    if (existente) return validarRepeticao(existente, dados);

    try {
      return await prisma.$transaction(async (transacao) => {
      const cardapio = await transacao.cardapio.findUnique({
        where: { id: dados.cardapioId },
      });

      if (!cardapio || cardapio.ativo === false) {
        throw new AppError("Cardápio não está disponível", 409);
      }

      const ids = dados.itens.map((item) => item.produtoId);
      const produtos = await transacao.produto.findMany({
        where: { id: { in: ids } },
        include: { categoria: true },
      });

      if (produtos.length !== ids.length) {
        throw new AppError("Um ou mais produtos não foram encontrados", 404);
      }

      const porId = new Map(produtos.map((produto) => [produto.id, produto]));
      let totalCentavos = 0;
      const itens = dados.itens.map((item) => {
        const produto = porId.get(item.produtoId);

        if (produto.categoria?.cardapioId !== dados.cardapioId) {
          throw new AppError("Produto não pertence ao cardápio informado", 409);
        }

        if (!produto.disponivel) {
          throw new AppError(`Produto indisponível: ${produto.nome}`, 409);
        }

        const precoCentavos = Math.round(Number(produto.preco) * 100);
        const subtotalCentavos = precoCentavos * item.quantidade;
        totalCentavos += subtotalCentavos;

        return {
          produtoId: produto.id,
          nomeProduto: produto.nome,
          precoUnitario: precoCentavos / 100,
          quantidade: item.quantidade,
          subtotal: subtotalCentavos / 100,
        };
      });

      if (totalCentavos <= 0 || totalCentavos > 9_999_999_999) {
        throw new AppError("Total do pedido excede o limite permitido", 409);
      }

      const pedido = await transacao.pedido.create({
        data: {
          cardapioId: dados.cardapioId,
          chaveIdempotencia: dados.chaveIdempotencia,
          clienteNome: dados.clienteNome,
          observacao: dados.observacao ?? null,
          total: totalCentavos / 100,
          itens: { create: itens },
        },
        include: { itens: true },
      });

      return formatar(pedido);
      }, { isolationLevel: "Serializable" });
    } catch (erro) {
      if (erro?.code === "P2002") {
        const repetido = await pedidoRepository.buscarPorChave(dados.chaveIdempotencia);
        if (repetido) return validarRepeticao(repetido, dados);
      }
      throw erro;
    }
  }

  async listar() {
    return (await pedidoRepository.listar()).map(formatar);
  }

  async atualizarStatus(id, status) {
    const existente = await pedidoRepository.buscarPorId(id);
    if (!existente) throw new AppError("Pedido não encontrado", 404);

    if (existente.status === status) return formatar(existente);

    const transicoes = {
      RECEBIDO: new Set(["EM_PREPARO", "CANCELADO"]),
      EM_PREPARO: new Set(["PRONTO", "CANCELADO"]),
      PRONTO: new Set(),
      CANCELADO: new Set(),
    };

    if (!transicoes[existente.status]?.has(status)) {
      throw new AppError(
        `Transição inválida de ${existente.status} para ${status}`,
        409
      );
    }

    return formatar(await pedidoRepository.atualizarStatus(id, status));
  }
}

export default new PedidoServices();
