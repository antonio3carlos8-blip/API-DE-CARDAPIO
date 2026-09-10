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

  if (erro?.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido" });
  }

  if (erro?.type === "entity.too.large") {
    return res.status(413).json({ erro: "Corpo da requisição muito grande" });
  }

  const erroPrisma = MENSAGENS_PRISMA[erro?.code];

  if (erroPrisma) {
    return res.status(erroPrisma.status).json({ erro: erroPrisma.mensagem });
  }

  if (
    erro?.code === "P1001" ||
    erro?.code === "P1002" ||
    erro?.code === "ECONNREFUSED" ||
    erro?.cause?.code === "ECONNREFUSED"
  ) {
    return res.status(503).json({ erro: "Serviço de dados indisponível" });
  }

  if (process.env.NODE_ENV !== "test") {
    console.error(erro);
  }

  return res.status(500).json({ erro: "Erro interno do servidor" });
};
