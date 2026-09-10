import { Router } from "express";
import cardapioRoutes from "./cardapioRoutes.js";
import categoriaRoutes from "./categoriaRoutes.js";
import produtoRoutes from "./produtoRoutes.js";
import authRoutes from "./authRoutes.js";
import pedidoRoutes from "./pedidoRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    nome: "API de Cardápio Digital",
    versao: "1.0.0",
    recursos: ["/cardapios", "/categorias", "/produtos", "/pedidos"],
  });
});

router.use("/auth", authRoutes);
router.use("/cardapios", cardapioRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/produtos", produtoRoutes);
router.use("/pedidos", pedidoRoutes);

export default router;
