import produtoRepository from "../repositories/produtoRepository.js";
import categoriaServices from "./categoriaServices.js";
import AppError from "../utils/AppError.js";
import { obterPaginacao } from "../validators/comumValidator.js";

const formatar = (produto) => {
  if (!produto) return produto;
  const categoria = produto.categoria
    ? Object.fromEntries(
        Object.entries(produto.categoria).filter(([chave]) => chave !== "cardapio")
      )
    : produto.categoria;
  return { ...produto, categoria, preco: Number(produto.preco) };
};

class ProdutoServices {
  async criar(dados) {
    await categoriaServices.garantirQueExiste(dados.categoriaId);
    return formatar(await produtoRepository.criar(dados));
  }

  async listar(filtros = {}, incluirInativos = false) {
    const produtos = await produtoRepository.listarComCategoria({
      ...filtros,
      ...obterPaginacao(filtros),
    }, incluirInativos);
    return produtos.map(formatar);
  }

  async buscarPorId(id, { incluirInativos = false } = {}) {
    const produto = await produtoRepository.buscarComCategoria(id);

    if (!produto || (!incluirInativos && produto.categoria?.cardapio?.ativo === false)) {
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
