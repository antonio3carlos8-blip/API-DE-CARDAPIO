import cardapioServices from "../services/cardapioServices.js";

class CardapioController {
  async criar(req, res) {
    const cardapio = await cardapioServices.criar(req.body);
    res.status(201).json(cardapio);
  }

  async listar(req, res) {
    const cardapios = await cardapioServices.listar(
      req.filtros,
      Boolean(req.autenticacao)
    );
    res.json(cardapios);
  }

  async buscarPorId(req, res) {
    const cardapio = await cardapioServices.buscarPorId(req.params.id, {
      incluirInativos: Boolean(req.autenticacao),
    });
    res.json(cardapio);
  }

  async atualizar(req, res) {
    const cardapio = await cardapioServices.atualizar(req.params.id, req.body);
    res.json(cardapio);
  }

  async excluir(req, res) {
    await cardapioServices.excluir(req.params.id);
    res.status(204).end();
  }
}

export default new CardapioController();
