import AppError from "../utils/AppError.js";

const MENSAGENS_PRISMA = {
  P2002: { status: 409, mensagem: "Registro duplicado" },
  P2003: { status: 409, mensagem: "Registro relacionado não encontrado" },
  P2025: { status: 404, mensagem: "Registro não encontrado" },
};

export const rotaNaoEncontrada = (req, res) => {
  res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
};

export const tratadorDeErros = (erro, req, res, next) => {
  if (res.headersSent) {
    return next(erro);
  }

  if (erro instanceof AppError) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  const erroPrisma = MENSAGENS_PRISMA[erro?.code];

  if (erroPrisma) {
    return res.status(erroPrisma.status).json({ erro: erroPrisma.mensagem });
  }

  console.error(erro);

  return res.status(500).json({ erro: "Erro interno do servidor" });
};
