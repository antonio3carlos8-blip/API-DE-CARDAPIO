import pedidoServices from "../services/pedidoServices.js";

class PedidoController {
  async criar(req, res) {
    const pedido = await pedidoServices.criar(req.body);
    return res.status(201).json(pedido);
  }

  async listar(req, res) {
    return res.json(await pedidoServices.listar());
  }

  async atualizarStatus(req, res) {
    return res.json(
      await pedidoServices.atualizarStatus(req.params.id, req.body.status)
    );
  }
}

export default new PedidoController();
