import cardapioRepositorio from "../repositories/cardapioRepositorio.js";
import AppError from "../utils/AppError.js";

class CardapioServices {
  async criar(dados) {
    return cardapioRepositorio.criar(dados);
  }

  async listar() {
    return cardapioRepositorio.listar({
      orderBy: { nome: "asc" },
    });
  }

  async buscarPorId(id) {
    const cardapio = await cardapioRepositorio.buscarComCategorias(id);

    if (!cardapio) {
      throw new AppError("Cardápio não encontrado", 404);
    }

    return cardapio;
  }

  async atualizar(id, dados) {
    await this.garantirQueExiste(id);
    return cardapioRepositorio.atualizar(id, dados);
  }

  async excluir(id) {
    const cardapio = await cardapioRepositorio.buscarComCategorias(id);

    if (!cardapio) {
      throw new AppError("Cardápio não encontrado", 404);
    }

    if (cardapio.categorias.length > 0) {
      throw new AppError(
        "Não é possível excluir um cardápio que possui categorias",
        409
      );
    }

    return cardapioRepositorio.excluir(id);
  }

  async garantirQueExiste(id) {
    const cardapio = await cardapioRepositorio.buscarPorId(id);

    if (!cardapio) {
      throw new AppError("Cardápio não encontrado", 404);
    }

    return cardapio;
  }
}

export default new CardapioServices();
