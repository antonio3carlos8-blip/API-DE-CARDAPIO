import { Router } from "express";
import produtoController from "../controllers/produtoController.js";
import {validarCorpo,validarParams,validarQuery} from "../middlewares/validar.js";
import {criarProdutoSchema,atualizarProdutoSchema,filtrosProdutoSchema} from "../validators/produtoValidator.js";
import { idParamSchema } from "../validators/comumValidator.js";
import {
  autenticarOpcionalmente,
  exigirAutenticacao,
} from "../middlewares/autenticacao.js";

const router = Router();

router.post("/", exigirAutenticacao, validarCorpo(criarProdutoSchema), produtoController.criar);
router.get("/", autenticarOpcionalmente, validarQuery(filtrosProdutoSchema), produtoController.listar);
router.get("/:id", autenticarOpcionalmente, validarParams(idParamSchema), produtoController.buscarPorId);
router.put("/:id", exigirAutenticacao, validarParams(idParamSchema), validarCorpo(atualizarProdutoSchema), produtoController.atualizar);
router.delete("/:id", exigirAutenticacao, validarParams(idParamSchema), produtoController.excluir);

export default router;
