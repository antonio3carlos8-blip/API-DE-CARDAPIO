import express from "express";
import cors from "cors";
import rotas from "./routes/index.js";
import {
  rotaNaoEncontrada,
  tratadorDeErros,
} from "./middlewares/tratadorDeErros.js";

const app = express();

// Em desenvolvimento libera qualquer origem. Em produção, defina
// CORS_ORIGIN no .env com as URLs do frontend separadas por vírgula.
const origens = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origem) => origem.trim())
  : true;

app.use(cors({ origin: origens }));

app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", rotas);

// Precisam ficar por último, nesta ordem
app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

export default app;
