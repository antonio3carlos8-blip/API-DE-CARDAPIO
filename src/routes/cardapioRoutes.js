import { Router } from "express";
import cardapioController from "../controllers/cardapioController.js";
import { validarCorpo, validarParams } from "../middlewares/validar.js";
import {
  criarCardapioSchema,
  atualizarCardapioSchema,
} from "../validators/cardapioValidator.js";
import { idParamSchema } from "../validators/comumValidator.js";

const router = Router();

router.post("/", validarCorpo(criarCardapioSchema), cardapioController.criar);
router.get("/", cardapioController.listar);
router.get("/:id",validarParams(idParamSchema),cardapioController.buscarPorId);
router.put("/:id",validarParams(idParamSchema),validarCorpo(atualizarCardapioSchema),cardapioController.atualizar,);
router.delete("/:id", validarParams(idParamSchema), cardapioController.excluir);

export default router;
