import { Router } from "express";
import cardapioController from "../controllers/cardapioController.js";
import { validarCorpo, validarParams } from "../middlewares/validar.js";
import {
  criarCardapioSchema,
  atualizarCardapioSchema,
  filtrosCardapioSchema,
} from "../validators/cardapioValidator.js";
import { idParamSchema } from "../validators/comumValidator.js";
import {
  autenticarOpcionalmente,
  exigirAutenticacao,
} from "../middlewares/autenticacao.js";
import { validarQuery } from "../middlewares/validar.js";

const router = Router();

router.post("/", exigirAutenticacao, validarCorpo(criarCardapioSchema), cardapioController.criar);
router.get("/", autenticarOpcionalmente, validarQuery(filtrosCardapioSchema), cardapioController.listar);
router.get("/:id", autenticarOpcionalmente, validarParams(idParamSchema), cardapioController.buscarPorId);
router.put("/:id", exigirAutenticacao, validarParams(idParamSchema), validarCorpo(atualizarCardapioSchema), cardapioController.atualizar);
router.delete("/:id", exigirAutenticacao, validarParams(idParamSchema), cardapioController.excluir);

export default router;
