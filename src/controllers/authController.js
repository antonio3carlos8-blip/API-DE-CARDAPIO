import { autenticarAdministrador } from "../middlewares/autenticacao.js";

class AuthController {
  async login(req, res) {
    const autenticacao = await autenticarAdministrador(
      req.body.usuario,
      req.body.senha
    );

    if (!autenticacao) {
      return res.status(401).json({ erro: "Usuário ou senha inválidos" });
    }

    return res.json(autenticacao);
  }

  async sessao(req, res) {
    return res.json(req.autenticacao);
  }
}

export default new AuthController();
