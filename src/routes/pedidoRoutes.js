import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import pedidoController from "../controllers/pedidoController.js";
import { exigirAutenticacao } from "../middlewares/autenticacao.js";
import { validarCorpo, validarParams } from "../middlewares/validar.js";
import { idParamSchema } from "../validators/comumValidator.js";
import {
  atualizarStatusPedidoSchema,
  criarPedidoSchema,
} from "../validators/pedidoValidator.js";

const router = Router();

const limitarPedidos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { erro: "Muitos pedidos; aguarde antes de tentar novamente" },
});

router.post("/", limitarPedidos, validarCorpo(criarPedidoSchema), pedidoController.criar);
router.get("/", exigirAutenticacao, pedidoController.listar);
router.patch(
  "/:id/status",
  exigirAutenticacao,
  validarParams(idParamSchema),
  validarCorpo(atualizarStatusPedidoSchema),
  pedidoController.atualizarStatus
);

export default router;
