import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Informe seu nome.").max(80),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
