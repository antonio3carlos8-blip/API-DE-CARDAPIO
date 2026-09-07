import categoriaServices from "../services/categoriaServices.js";

class CategoriaController {
  async criar(req, res) {
    const categoria = await categoriaServices.criar(req.body);
    res.status(201).json(categoria);
  }

  async listar(req, res) {
    const categorias = await categoriaServices.listar(req.filtros);
    res.json(categorias);
  }

  async buscarPorId(req, res) {
    const categoria = await categoriaServices.buscarPorId(req.params.id);
    res.json(categoria);
  }

  async atualizar(req, res) {
    const categoria = await categoriaServices.atualizar(req.params.id, req.body);
    res.json(categoria);
  }

  async excluir(req, res) {
    await categoriaServices.excluir(req.params.id);
    res.status(204).end();
  }
}

export default new CategoriaController();
