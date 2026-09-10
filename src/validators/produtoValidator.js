import { z } from "zod";
import { camposPaginacao, urlHttpSchema } from "./comumValidator.js";

export const criarProdutoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(120),
  descricao: z
    .string()
    .trim()
    .max(500)
    .transform((valor) => (valor === "" ? null : valor))
    .optional()
    .nullable(),
  preco: z
    .number("Preço deve ser um número")
    .finite("Preço deve ser finito")
    .positive("Preço deve ser maior que zero")
    .max(99_999_999.99, "Preço excede o limite permitido")
    .multipleOf(0.01, "Preço deve ter no máximo duas casas decimais"),
  imagemUrl: z
    .union([urlHttpSchema, z.literal("")])
    .transform((valor) => (valor === "" ? null : valor))
    .optional()
    .nullable(),
  disponivel: z.boolean().optional(),
  categoriaId: z.uuid("categoriaId deve ser um UUID válido"),
}).strict();

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
  busca: z
    .string()
    .trim()
    .transform((valor) => (valor === "" ? undefined : valor))
    .optional(),
  ...camposPaginacao,
}).strict();
