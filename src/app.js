import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import rotas from "./routes/index.js";
import {
  rotaNaoEncontrada,
  tratadorDeErros,
} from "./middlewares/tratadorDeErros.js";
import {
  obterOrigensPermitidas,
  validarConfiguracaoProducao,
} from "./config/runtime.js";
import prisma from "./config/prisma.js";

validarConfiguracaoProducao();

const app = express();
app.disable("x-powered-by");
app.use(helmet());

const origens = obterOrigensPermitidas();

app.use(
  cors({
    origin(origem, callback) {
      callback(null, !origem || origens.includes(origem));
    },
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "test",
    message: { erro: "Muitas requisições; tente novamente mais tarde" },
  })
);

app.get("/health/live", (req, res) => res.json({ status: "ok" }));

const readiness = async (req, res) => {
  try {
    await Promise.race([
      prisma.$queryRawUnsafe("SELECT 1"),
      new Promise((_, rejeitar) =>
        setTimeout(() => rejeitar(new Error("Readiness timeout")), 3_000)
      ),
    ]);
    return res.json({ status: "ok" });
  } catch {
    return res.status(503).json({ status: "indisponível" });
  }
};

app.get("/health", readiness);
app.get("/health/ready", readiness);

app.use("/api", rotas);

// Precisam ficar por último, nesta ordem
app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

export default app;
