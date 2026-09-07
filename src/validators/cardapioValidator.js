import { z } from "zod";

export const criarCardapioSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(120),
  descricao: z.string().trim().max(500).optional().nullable(),
  ativo: z.boolean().optional(),
});

export const atualizarCardapioSchema = criarCardapioSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });
