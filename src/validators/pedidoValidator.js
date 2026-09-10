import { z } from "zod";

const itemPedidoSchema = z
  .object({
    produtoId: z.uuid("produtoId deve ser um UUID válido"),
    quantidade: z
      .number("quantidade deve ser um número")
      .int("quantidade deve ser inteira")
      .min(1, "quantidade mínima é 1")
      .max(20, "quantidade máxima por item é 20"),
  })
  .strict();

export const criarPedidoSchema = z
  .object({
    cardapioId: z.uuid("cardapioId deve ser um UUID válido"),
    chaveIdempotencia: z.uuid("chaveIdempotencia deve ser um UUID válido"),
    clienteNome: z.string().trim().min(2, "Informe seu nome").max(80),
    observacao: z
      .string()
      .trim()
      .max(500)
      .transform((valor) => (valor === "" ? null : valor))
      .optional()
      .nullable(),
    itens: z.array(itemPedidoSchema).min(1, "Inclua ao menos um item").max(50),
  })
  .strict()
  .refine(
    (dados) => new Set(dados.itens.map((item) => item.produtoId)).size === dados.itens.length,
    { message: "Agrupe quantidades do mesmo produto", path: ["itens"] }
  );

export const atualizarStatusPedidoSchema = z
  .object({
    status: z.enum(["RECEBIDO", "EM_PREPARO", "PRONTO", "CANCELADO"]),
  })
  .strict();
