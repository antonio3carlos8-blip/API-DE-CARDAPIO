import produtoRepository from "../repositories/produtoRepository.js";
import categoriaServices from "./categoriaServices.js";
import AppError from "../utils/AppError.js";

const formatar = (produto) =>
  produto && { ...produto, preco: Number(produto.preco) };

class ProdutoServices {
  async criar(dados) {
    await categoriaServices.garantirQueExiste(dados.categoriaId);
    return formatar(await produtoRepository.criar(dados));
  }

  async listar(filtros = {}) {
    const produtos = await produtoRepository.listarComCategoria(filtros);
    return produtos.map(formatar);
  }

  async buscarPorId(id) {
    const produto = await produtoRepository.buscarComCategoria(id);

    if (!produto) {
      throw new AppError("Produto não encontrado", 404);
    }

    return formatar(produto);
  }

  async atualizar(id, dados) {
    await this.garantirQueExiste(id);

    if (dados.categoriaId) {
      await categoriaServices.garantirQueExiste(dados.categoriaId);
    }

    return formatar(await produtoRepository.atualizar(id, dados));
  }

  async excluir(id) {
    await this.garantirQueExiste(id);
    return produtoRepository.excluir(id);
  }

  async garantirQueExiste(id) {
    const produto = await produtoRepository.buscarPorId(id);

    if (!produto) {
      throw new AppError("Produto não encontrado", 404);
    }

    return produto;
  }
}

export default new ProdutoServices();
