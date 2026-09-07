import { Router } from "express";
import cardapioRoutes from "./cardapioRoutes.js";
import categoriaRoutes from "./categoriaRoutes.js";
import produtoRoutes from "./produtoRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    nome: "API de Cardápio Digital",
    versao: "1.0.0",
    recursos: ["/cardapios", "/categorias", "/produtos"],
  });
});

router.use("/cardapios", cardapioRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/produtos", produtoRoutes);

export default router;
