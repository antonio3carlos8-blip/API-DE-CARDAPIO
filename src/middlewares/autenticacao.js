import { createHash, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { obterConfiguracaoAdmin } from "../config/runtime.js";

const ISSUER = "cardapio-api";
const AUDIENCE = "cardapio-admin";
const DURACAO_SEGUNDOS = 8 * 60 * 60;

const compararEmTempoConstante = (recebido, esperado) => {
  const hashRecebido = createHash("sha256").update(recebido).digest();
  const hashEsperado = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(hashRecebido, hashEsperado);
};

export const autenticarAdministrador = async (usuario, senha) => {
  const configuracao = obterConfiguracaoAdmin();
  const usuarioValido = compararEmTempoConstante(usuario, configuracao.usuario);
  const senhaValida = compararEmTempoConstante(senha, configuracao.senha);

  if (!usuarioValido || !senhaValida) {
    return null;
  }

  const agora = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({ papel: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(configuracao.usuario)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt(agora)
    .setExpirationTime(agora + DURACAO_SEGUNDOS)
    .sign(new TextEncoder().encode(configuracao.jwtSecret));

  return {
    token,
    usuario: configuracao.usuario,
    expiresIn: DURACAO_SEGUNDOS,
  };
};

const verificarToken = async (token) => {
    const { jwtSecret } = obterConfiguracaoAdmin();
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
      { issuer: ISSUER, audience: AUDIENCE }
    );

    if (payload.papel !== "admin" || !payload.sub) {
      throw new Error("Token sem autorização administrativa");
    }

    return { usuario: payload.sub, papel: payload.papel };
};

const extrairToken = (req) => {
  const authorization = req.get("authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
};

export const exigirAutenticacao = async (req, res, next) => {
  const token = extrairToken(req);

  if (!token) {
    return res.status(401).json({ erro: "Autenticação necessária" });
  }

  try {
    req.autenticacao = await verificarToken(token);
    return next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada" });
  }
};

export const autenticarOpcionalmente = async (req, res, next) => {
  const authorization = req.get("authorization");
  if (!authorization) return next();

  const token = extrairToken(req);
  if (!token) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada" });
  }

  try {
    req.autenticacao = await verificarToken(token);
    return next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada" });
  }
};
