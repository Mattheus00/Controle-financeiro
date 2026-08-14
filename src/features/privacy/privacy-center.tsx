"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui-kit";
import {
  createPrivacyRequestAction,
  deleteAccountAction,
  deleteHistoryAction,
  deleteReceiptsAction,
  requestDataExportAction,
} from "@/features/privacy/actions";
import {
  DELETE_ACCOUNT_CONFIRMATION,
  POLICY_VERSION,
} from "@/lib/privacy/config";

type Consent = {
  consent_type: string;
  policy_version: string;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
};

type RequestRow = {
  id: string;
  type: string;
  status: string;
  created_at: string;
  message: string | null;
};

export function PrivacyCenter({
  consents,
  requests,
  contactName,
  contactEmail,
}: {
  consents: Consent[];
  requests: RequestRow[];
  contactName: string;
  contactEmail: string;
}) {
  return (
    <section className="space-y-6 rounded-3xl bg-card p-5 ring-1 ring-border">
      <p className="text-sm text-muted-foreground">
        Seus dados financeiros ficam ligados à sua conta. Comprovantes ficam em área privada. Versão
        das políticas: {POLICY_VERSION}.
      </p>

      <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
        <p className="font-medium">Seus dados</p>
        <p className="mt-1 text-muted-foreground">
          Nome, e-mail, contas, cartões (apelido e 4 últimos dígitos), transações, comprovantes e
          preferências. Não pedimos CPF, número completo de cartão, CVV ou senha bancária.
        </p>
        {consents.length > 0 ? (
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {consents.map((item) => (
              <li key={`${item.consent_type}-${item.policy_version}`}>
                {item.consent_type} · versão {item.policy_version} ·{" "}
                {item.granted && !item.revoked_at ? "registrado" : "revogado"}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div id="exportar">
        <ExportForm />
      </div>
      <DeleteReceiptsForm />
      <DeleteHistoryForm />
      <CookiePreferences />
      <MarketingNote />
      <div id="excluir">
        <DeleteAccountForm />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/privacidade" className="font-medium underline-offset-4 hover:underline">
          Política de Privacidade
        </Link>
        <Link href="/termos" className="font-medium underline-offset-4 hover:underline">
          Termos de Uso
        </Link>
      </div>

      <PrivacyRequestForm requests={requests} />

      {(contactEmail || contactName) && (
        <p className="text-xs text-muted-foreground">
          Contato de privacidade
          {contactName ? `: ${contactName}` : ""}
          {contactEmail ? ` · ${contactEmail}` : ""}
        </p>
      )}
    </section>
  );
}

function CookiePreferences() {
  return (
    <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
      <p className="font-medium">Cookies</p>
      <p className="mt-1 text-muted-foreground">
        O Folio usa apenas cookies estritamente necessários para manter sua sessão autenticada. Não
        carregamos analytics, publicidade ou pixels de terceiros.
      </p>
    </div>
  );
}

function ActionResult({ message, tone }: { message: string | null; tone: "ok" | "err" }) {
  if (!message) return null;
  return <p className={`text-sm ${tone === "err" ? "text-danger" : "text-muted-foreground"}`}>{message}</p>;
}

export function ExportForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setMessage(null);
        start(async () => {
          const result = await requestDataExportAction(formData);
          if (!result.success) {
            setTone("err");
            setMessage(result.error.message);
            return;
          }
          setTone("ok");
          setMessage("Arquivo pronto. O link expira em poucos minutos.");
          window.location.assign(result.data.url);
        });
      }}
    >
      <h3 className="font-medium">Baixar meus dados</h3>
      <p className="text-sm text-muted-foreground">
        Gera um ZIP com perfil, contas, transações e comprovantes. Confirmamos sua senha antes.
      </p>
      <Field label="Senha atual" htmlFor="export-password">
        <PasswordInput id="export-password" name="password" required className="h-11" autoComplete="current-password" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-2xl">
        {pending ? "Preparando..." : "Baixar meus dados"}
      </Button>
      <ActionResult message={message} tone={tone} />
    </form>
  );
}

function DeleteReceiptsForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setMessage(null);
        start(async () => {
          const result = await deleteReceiptsAction(formData);
          setMessage(result.success ? "Comprovantes excluídos." : result.error.message);
        });
      }}
    >
      <h3 className="font-medium">Excluir comprovantes</h3>
      <p className="text-sm text-muted-foreground">
        Remove arquivos enviados e leituras de OCR. As transações continuam.
      </p>
      <Field label="Senha atual" htmlFor="receipts-password">
        <PasswordInput id="receipts-password" name="password" required className="h-11" autoComplete="current-password" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-2xl">
        {pending ? "Excluindo..." : "Excluir comprovantes"}
      </Button>
      <ActionResult message={message} tone={message?.includes("exclu") ? "ok" : "err"} />
    </form>
  );
}

function DeleteHistoryForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setMessage(null);
        start(async () => {
          const result = await deleteHistoryAction(formData);
          setMessage(result.success ? "Histórico financeiro excluído." : result.error.message);
        });
      }}
    >
      <h3 className="font-medium">Excluir histórico</h3>
      <p className="text-sm text-muted-foreground">
        Apaga transações, contas a pagar, comprovantes e leituras. Perfil e contas bancárias
        cadastradas permanecem.
      </p>
      <Field label="Senha atual" htmlFor="history-password">
        <PasswordInput id="history-password" name="password" required className="h-11" autoComplete="current-password" />
      </Field>
      <Field label="Digite EXCLUIR HISTORICO" htmlFor="history-confirm">
        <Input id="history-confirm" name="confirmation" required className="h-11" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-2xl">
        {pending ? "Excluindo..." : "Excluir histórico"}
      </Button>
      <ActionResult message={message} tone={message?.includes("exclu") ? "ok" : "err"} />
    </form>
  );
}

function MarketingNote() {
  return (
    <div className="rounded-2xl bg-muted px-4 py-3 text-sm">
      <p className="font-medium">Preferências de privacidade</p>
      <p className="mt-1 text-muted-foreground">
        O Folio não envia e-mail de marketing. Não pedimos esse aceite porque o tratamento não
        existe hoje. Se isso mudar, o aceite será específico, desmarcado por padrão e revogável
        aqui.
      </p>
    </div>
  );
}

export function DeleteAccountForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-2xl bg-muted px-4 py-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setMessage(null);
        start(async () => {
          const result = await deleteAccountAction(formData);
          if (result && !result.success) setMessage(result.error.message);
        });
      }}
    >
      <h3 className="font-medium">Excluir minha conta</h3>
      <p className="text-sm text-muted-foreground">
        Isso remove perfil, transações, cartões, metas, comprovantes, sessões e arquivos. A ação não
        pode ser desfeita. Cópias em backup seguem a política de retenção até expirarem.
      </p>
      <Field label="Senha atual" htmlFor="delete-password">
        <PasswordInput id="delete-password" name="password" required className="h-11" autoComplete="current-password" />
      </Field>
      <Field label={`Digite ${DELETE_ACCOUNT_CONFIRMATION}`} htmlFor="delete-confirm">
        <Input id="delete-confirm" name="confirmation" required className="h-11" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-2xl">
        {pending ? "Excluindo conta..." : "Excluir minha conta"}
      </Button>
      <ActionResult message={message} tone="err" />
    </form>
  );
}

function PrivacyRequestForm({ requests }: { requests: RequestRow[] }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Solicitar atendimento sobre meus dados</h3>
      <p className="text-sm text-muted-foreground">
        Use para correção, informações ou outras solicitações previstas na LGPD.
      </p>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setMessage(null);
          start(async () => {
            const result = await createPrivacyRequestAction(formData);
            setMessage(result.success ? "Solicitação registrada." : result.error.message);
            if (result.success) event.currentTarget.reset();
          });
        }}
      >
        <Field label="Tipo" htmlFor="request-type">
          <select id="request-type" name="type" className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
            <option value="INFORMATION">Informação sobre o tratamento</option>
            <option value="ACCESS">Acesso aos dados</option>
            <option value="CORRECTION">Correção</option>
            <option value="EXPORT">Exportação</option>
            <option value="REVOCATION">Revogação de consentimento</option>
            <option value="DELETION">Exclusão</option>
          </select>
        </Field>
        <Field label="Mensagem" htmlFor="request-message">
          <textarea
            id="request-message"
            name="message"
            required
            minLength={8}
            className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          />
        </Field>
        <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-2xl">
          {pending ? "Enviando..." : "Enviar solicitação"}
        </Button>
        <ActionResult message={message} tone={message?.includes("registrada") ? "ok" : "err"} />
      </form>
      {requests.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {requests.map((row) => (
            <li key={row.id} className="rounded-2xl bg-muted px-3 py-2">
              {row.type} · {row.status} · {new Date(row.created_at).toLocaleDateString("pt-BR")}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
