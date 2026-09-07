import { z } from "zod";

export const criarProdutoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(120),
  descricao: z.string().trim().max(500).optional().nullable(),
  preco: z.coerce.number().positive("Preço deve ser maior que zero"),
  imagemUrl: z.url("imagemUrl deve ser uma URL válida").optional().nullable(),
  disponivel: z.boolean().optional(),
  categoriaId: z.uuid("categoriaId deve ser um UUID válido"),
});

export const atualizarProdutoSchema = criarProdutoSchema
  .partial()
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar",
  });

export const filtrosProdutoSchema = z.object({
  categoriaId: z.uuid("categoriaId deve ser um UUID válido").optional(),
  disponivel: z
    .enum(["true", "false"])
    .transform((valor) => valor === "true")
    .optional(),
  busca: z.string().trim().min(1).optional(),
});
