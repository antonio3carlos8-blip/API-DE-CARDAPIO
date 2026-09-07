import categoriaRepository from "../repositories/categoriaRepository.js";
import cardapioServices from "./cardapioServices.js";
import AppError from "../utils/AppError.js";

class CategoriaServices {
  async criar(dados) {
    await cardapioServices.garantirQueExiste(dados.cardapioId);
    return categoriaRepository.criar(dados);
  }

  async listar(filtros = {}) {
    if (filtros.cardapioId) {
      return categoriaRepository.listarPorCardapio(filtros.cardapioId);
    }

    return categoriaRepository.listar({
      orderBy: { nome: "asc" },
    });
  }

  async buscarPorId(id) {
    const categoria = await categoriaRepository.buscarComProdutos(id);

    if (!categoria) {
      throw new AppError("Categoria não encontrada", 404);
    }

    return categoria;
  }

  async atualizar(id, dados) {
    await this.garantirQueExiste(id);

    if (dados.cardapioId) {
      await cardapioServices.garantirQueExiste(dados.cardapioId);
    }

    return categoriaRepository.atualizar(id, dados);
  }

  async excluir(id) {
    const categoria = await categoriaRepository.buscarComProdutos(id);

    if (!categoria) {
      throw new AppError("Categoria não encontrada", 404);
    }

    if (categoria.produtos.length > 0) {
      throw new AppError(
        "Não é possível excluir uma categoria que possui produtos",
        409
      );
    }

    return categoriaRepository.excluir(id);
  }

  async garantirQueExiste(id) {
    const categoria = await categoriaRepository.buscarPorId(id);

    if (!categoria) {
      throw new AppError("Categoria não encontrada", 404);
    }

    return categoria;
  }
}

export default new CategoriaServices();
