import { z } from "zod";

export const idParamSchema = z.object({
  id: z.uuid("ID deve ser um UUID válido"),
});
