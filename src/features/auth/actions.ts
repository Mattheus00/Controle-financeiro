"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/errors";
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/validations/auth";
import { signupLegalSchema } from "@/validations/privacy";
import { enforceRateLimit } from "@/lib/privacy/rate-limit";
import { POLICY_VERSION } from "@/lib/privacy/config";
import { writeAuditEvent } from "@/lib/privacy/audit";

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const supabase = await createClient();
  const limited = await enforceRateLimit(supabase, "login", parsed.data.email);
  if (limited) return limited;
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return fail("AUTH_FAILED", "E-mail ou senha incorretos.");
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const legal = signupLegalSchema.safeParse({
    accepted_privacy: formData.get("accepted_privacy") === "on",
    accepted_terms: formData.get("accepted_terms") === "on",
  });
  if (!legal.success) return fail("VALIDATION_ERROR", legal.error.issues[0]?.message ?? "Aceite os termos para criar a conta.");

  const supabase = await createClient();
  const limited = await enforceRateLimit(supabase, "signup", parsed.data.email);
  if (limited) return limited;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        accepted_privacy_version: POLICY_VERSION,
        accepted_terms_version: POLICY_VERSION,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error && !data.user) return fail("SIGNUP_FAILED", "Não foi possível criar a conta. Tente outro e-mail.");
  if (data.session) redirect("/dashboard");

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (signInError) return fail("SIGNUP_FAILED", "Conta criada. Entre com o mesmo e-mail e senha.");
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "E-mail inválido.");
  const supabase = await createClient();
  const limited = await enforceRateLimit(supabase, "forgotPassword", parsed.data.email);
  if (limited) return limited;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  return ok({ sent: true });
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return fail("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Senha inválida.");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail("RESET_FAILED", "Não foi possível atualizar a senha.");
  await writeAuditEvent(supabase, "PASSWORD_CHANGED", {});
  redirect("/dashboard");
}
