import { Router } from "express";
import categoriaController from "../controllers/categoriaController.js";
import {
  validarCorpo,
  validarParams,
  validarQuery,
} from "../middlewares/validar.js";
import {criarCategoriaSchema,atualizarCategoriaSchema,filtrosCategoriaSchema,} from "../validators/categoriaValidator.js";
import { idParamSchema } from "../validators/comumValidator.js";

const router = Router();

router.post("/", validarCorpo(criarCategoriaSchema), categoriaController.criar);
router.get("/", validarQuery(filtrosCategoriaSchema), categoriaController.listar);
router.get("/:id",validarParams(idParamSchema),categoriaController.buscarPorId);
router.put("/:id",validarParams(idParamSchema),validarCorpo(atualizarCategoriaSchema),categoriaController.atualizar);
router.delete("/:id", validarParams(idParamSchema), categoriaController.excluir);

export default router;
