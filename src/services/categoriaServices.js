import categoriaRepository from "../repositories/categoriaRepository.js";
import cardapioServices from "./cardapioServices.js";
import AppError from "../utils/AppError.js";
import { obterPaginacao } from "../validators/comumValidator.js";

class CategoriaServices {
  async criar(dados) {
    await cardapioServices.garantirQueExiste(dados.cardapioId);
    return categoriaRepository.criar(dados);
  }

  async listar(filtros = {}, incluirInativos = false) {
    if (filtros.cardapioId) {
      if (!incluirInativos) {
        await cardapioServices.buscarPorId(filtros.cardapioId);
      }
      return categoriaRepository.listarPorCardapio(
        filtros.cardapioId,
        obterPaginacao(filtros)
      );
    }

    return categoriaRepository.listar({
      where: incluirInativos ? undefined : { cardapio: { ativo: true } },
      orderBy: { nome: "asc" },
      ...obterPaginacao(filtros),
    });
  }

  async buscarPorId(id, { incluirInativos = false } = {}) {
    const categoria = await categoriaRepository.buscarComProdutos(id);

    if (!categoria || (!incluirInativos && categoria.cardapio?.ativo === false)) {
      throw new AppError("Categoria não encontrada", 404);
    }

    const { cardapio, ...dadosCategoria } = categoria;
    return {
      ...dadosCategoria,
      produtos: categoria.produtos?.map((prod) => ({
        ...prod,
        preco: Number(prod.preco),
      })),
    };
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
