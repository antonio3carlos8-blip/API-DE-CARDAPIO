const formatarErros = (erro) =>
  erro.issues.map((problema) => ({
    campo: problema.path.join(".") || "corpo",
    mensagem: problema.message,
  }));

export const validarCorpo = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: formatarErros(resultado.error),
    });
  }

  req.body = resultado.data;
  next();
};

export const validarParams = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.params);

  if (!resultado.success) {
    return res.status(400).json({
      erro: "Parâmetro inválido",
      detalhes: formatarErros(resultado.error),
    });
  }

  next();
};


export const validarQuery = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.query);

  if (!resultado.success) {
    return res.status(400).json({
      erro: "Filtros inválidos",
      detalhes: formatarErros(resultado.error),
    });
  }

  req.filtros = resultado.data;
  next();
};
