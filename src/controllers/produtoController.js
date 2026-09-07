import produtoServices from "../services/produtoServices.js";

class ProdutoController {
  async criar(req, res) {
    const produto = await produtoServices.criar(req.body);
    res.status(201).json(produto);
  }

  async listar(req, res) {
    const produtos = await produtoServices.listar(req.filtros);
    res.json(produtos);
  }

  async buscarPorId(req, res) {
    const produto = await produtoServices.buscarPorId(req.params.id);
    res.json(produto);
  }

  async atualizar(req, res) {
    const produto = await produtoServices.atualizar(req.params.id, req.body);
    res.json(produto);
  }

  async excluir(req, res) {
    await produtoServices.excluir(req.params.id);
    res.status(204).end();
  }
}

export default new ProdutoController();
