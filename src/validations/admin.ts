import { z } from "zod";

export const adminRequestIdSchema = z.object({
  requestId: z.string().uuid("Solicitação inválida."),
});

export const adminResponseSchema = adminRequestIdSchema.extend({
  resolution: z.enum(["COMPLETED", "REJECTED"]),
  response: z
    .string()
    .trim()
    .min(8, "Escreva uma resposta com pelo menos 8 caracteres.")
    .max(4000, "A resposta deve ter no máximo 4000 caracteres."),
});

export type AdminResolution = z.infer<typeof adminResponseSchema>["resolution"];
