import { z } from "zod";
import { camposPaginacao } from "./comumValidator.js";

export const criarCategoriaSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(120),
  cardapioId: z.uuid("cardapioId deve ser um UUID válido"),
}).strict();

export const atualizarCategoriaSchema = criarCategoriaSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const filtrosCategoriaSchema = z.object({
  cardapioId: z.uuid("cardapioId deve ser um UUID válido").optional(),
  ...camposPaginacao,
}).strict();
