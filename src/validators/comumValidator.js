import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid("ID deve ser um UUID válido"),
}).strict();

export const urlHttpSchema = z
  .url("deve ser uma URL válida")
  .max(2048, "URL deve ter no máximo 2048 caracteres")
  .refine((valor) => {
    try {
      const protocolo = new URL(valor).protocol;
      return protocolo === "http:" || protocolo === "https:";
    } catch {
      return false;
    }
  }, "URL deve usar http ou https");

const inteiroQuery = (campo, maximo) =>
  z
    .string(`${campo} deve ser texto numérico`)
    .regex(/^\d+$/, `${campo} deve ser um número inteiro positivo`)
    .transform(Number)
    .refine((valor) => valor >= 1 && valor <= maximo, {
      message: `${campo} deve estar entre 1 e ${maximo}`,
    });

export const camposPaginacao = {
  pagina: inteiroQuery("pagina", 100_000).optional(),
  limite: inteiroQuery("limite", 100).optional(),
};

export const obterPaginacao = ({ pagina = 1, limite = 50 } = {}) => ({
  skip: (pagina - 1) * limite,
  take: limite,
});
