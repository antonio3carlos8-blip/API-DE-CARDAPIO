import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import authController from "../controllers/authController.js";
import { exigirAutenticacao } from "../middlewares/autenticacao.js";
import { validarCorpo } from "../middlewares/validar.js";
import { loginSchema } from "../validators/authValidator.js";

const router = Router();

const limitarLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { erro: "Muitas tentativas de login; tente novamente mais tarde" },
});

router.post("/login", limitarLogin, validarCorpo(loginSchema), authController.login);
router.get("/sessao", exigirAutenticacao, authController.sessao);

export default router;
