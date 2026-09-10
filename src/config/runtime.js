const ORIGENS_LOCAIS = ["http://localhost:3000", "http://127.0.0.1:3000"];

export const emProducao = () => process.env.NODE_ENV === "production";

export const obterOrigensPermitidas = () => {
  const configuradasBrutas = process.env.CORS_ORIGIN
    ?.split(",")
    .map((origem) => origem.trim())
    .filter(Boolean);

  if (configuradasBrutas?.length) {
    const configuradas = configuradasBrutas.map((origem) => {
      try {
        const url = new URL(origem);
        if (
          !new Set(["http:", "https:"]).has(url.protocol) ||
          url.pathname !== "/" ||
          url.search ||
          url.hash
        ) {
          throw new Error("origem inválida");
        }
        return url.origin;
      } catch {
        throw new Error(`CORS_ORIGIN contém origem inválida: ${origem}`);
      }
    });
    return [...new Set(configuradas)];
  }

  if (emProducao()) {
    throw new Error("CORS_ORIGIN é obrigatória em produção");
  }

  return ORIGENS_LOCAIS;
};

export const obterConfiguracaoAdmin = () => {
  const usuario = process.env.ADMIN_USERNAME || "admin";
  const senha = process.env.ADMIN_PASSWORD || "admin";
  const jwtSecret =
    process.env.JWT_SECRET ||
    "segredo-exclusivo-do-ambiente-local-de-desenvolvimento";

  if (emProducao()) {
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
      throw new Error("ADMIN_PASSWORD deve ter ao menos 12 caracteres em produção");
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error("JWT_SECRET deve ter ao menos 32 caracteres em produção");
    }
  }

  return { usuario, senha, jwtSecret };
};

export const obterDatabaseUrl = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL é obrigatória para usar PostgreSQL");
  }

  return process.env.DATABASE_URL;
};

export const obterHost = () =>
  process.env.HOST || (emProducao() ? "0.0.0.0" : "127.0.0.1");

export const validarConfiguracaoProducao = () => {
  if (!emProducao()) return;
  obterDatabaseUrl();
  obterOrigensPermitidas();
  obterConfiguracaoAdmin();
};
