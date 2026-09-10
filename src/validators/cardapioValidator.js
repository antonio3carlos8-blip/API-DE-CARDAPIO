import { z } from "zod";
import { camposPaginacao, urlHttpSchema } from "./comumValidator.js";

export const criarCardapioSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(120),
  descricao: z
    .string()
    .trim()
    .max(500)
    .transform((valor) => (valor === "" ? null : valor))
    .optional()
    .nullable(),
  imagemUrl: z
    .union([urlHttpSchema, z.literal("")])
    .transform((valor) => (valor === "" ? null : valor))
    .optional()
    .nullable(),
  ativo: z.boolean().optional(),
}).strict();

export const atualizarCardapioSchema = criarCardapioSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const filtrosCardapioSchema = z.object(camposPaginacao).strict();
