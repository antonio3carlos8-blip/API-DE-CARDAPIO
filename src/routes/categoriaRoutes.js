import { Router } from "express";
import categoriaController from "../controllers/categoriaController.js";
import {
  validarCorpo,
  validarParams,
  validarQuery,
} from "../middlewares/validar.js";
import {criarCategoriaSchema,atualizarCategoriaSchema,filtrosCategoriaSchema,} from "../validators/categoriaValidator.js";
import { idParamSchema } from "../validators/comumValidator.js";
import {
  autenticarOpcionalmente,
  exigirAutenticacao,
} from "../middlewares/autenticacao.js";

const router = Router();

router.post("/", exigirAutenticacao, validarCorpo(criarCategoriaSchema), categoriaController.criar);
router.get("/", autenticarOpcionalmente, validarQuery(filtrosCategoriaSchema), categoriaController.listar);
router.get("/:id", autenticarOpcionalmente, validarParams(idParamSchema), categoriaController.buscarPorId);
router.put("/:id", exigirAutenticacao, validarParams(idParamSchema), validarCorpo(atualizarCategoriaSchema), categoriaController.atualizar);
router.delete("/:id", exigirAutenticacao, validarParams(idParamSchema), categoriaController.excluir);

export default router;
