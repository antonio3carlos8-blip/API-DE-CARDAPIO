import { Router } from "express";
import produtoController from "../controllers/produtoController.js";
import {validarCorpo,validarParams,validarQuery} from "../middlewares/validar.js";
import {criarProdutoSchema,atualizarProdutoSchema,filtrosProdutoSchema} from "../validators/produtoValidator.js";
import { idParamSchema } from "../validators/comumValidator.js";

const router = Router();

router.post("/", validarCorpo(criarProdutoSchema), produtoController.criar);
router.get("/", validarQuery(filtrosProdutoSchema), produtoController.listar);
router.get("/:id", validarParams(idParamSchema), produtoController.buscarPorId);
router.put("/:id",validarParams(idParamSchema),validarCorpo(atualizarProdutoSchema),produtoController.atualizar);
router.delete("/:id", validarParams(idParamSchema), produtoController.excluir);

export default router;
