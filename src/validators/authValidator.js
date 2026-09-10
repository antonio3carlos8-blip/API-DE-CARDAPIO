import { z } from "zod";

export const loginSchema = z
  .object({
    usuario: z.string().trim().min(1).max(120),
    senha: z.string().min(1).max(256),
  })
  .strict();
