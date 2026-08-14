"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  CircleDot,
  Clock3,
  MailCheck,
  RefreshCw,
  Send,
  UserRoundCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Field } from "@/components/ui-kit";
import { startPrivacyRequestAction, respondPrivacyRequestAction } from "@/features/admin/actions";
import { createClient } from "@/lib/supabase/client";
import type { AdminMetrics, AdminPrivacyRequest } from "@/services/admin-service";
import type { AdminResolution } from "@/validations/admin";

const STATUS_LABELS = {
  OPEN: "Aberta",
  PROCESSING: "Em atendimento",
  COMPLETED: "Concluída",
  REJECTED: "Rejeitada",
} as const;

const TYPE_LABELS: Record<string, string> = {
  ACCESS: "Acesso aos dados",
  CORRECTION: "Correção",
  EXPORT: "Exportação",
  DELETION: "Exclusão",
  INFORMATION: "Informação",
  REVOCATION: "Revogação",
};

type RequestStatus = keyof typeof STATUS_LABELS;
type Filter = "ALL" | RequestStatus;

export function AdminDashboard({
  metrics,
  requests,
  adminUserId,
}: {
  metrics: AdminMetrics;
  requests: AdminPrivacyRequest[];
  adminUserId: string;
}) {
  const router = useRouter();
  const [onlineClients, setOnlineClients] = useState(0);
  const [presenceConnected, setPresenceConnected] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");

  useEffect(() => {
    const supabase = createClient();
    const presence = supabase.channel("folio:presence", { config: { private: true } });
    const requestChanges = supabase.channel(`admin:privacy-requests:${adminUserId}`);
    let active = true;

    presence.on("presence", { event: "sync" }, () => {
      const userIds = new Set<string>();
      for (const entries of Object.values(presence.presenceState())) {
        for (const entry of entries) {
          const presenceEntry = entry as typeof entry & { user_id?: unknown };
          const userId = typeof presenceEntry.user_id === "string" ? presenceEntry.user_id : null;
          if (userId) userIds.add(userId);
        }
      }
      if (active) setOnlineClients(userIds.size);
    });

    void supabase.realtime.setAuth().then(() => {
      if (!active) return;
      presence.subscribe((status) => {
        if (!active) return;
        setPresenceConnected(status === "SUBSCRIBED");
      });

      requestChanges
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "privacy_requests" },
          () => router.refresh(),
        )
        .subscribe();
    });

    return () => {
      active = false;
      void supabase.removeChannel(presence);
      void supabase.removeChannel(requestChanges);
    };
  }, [adminUserId, router]);

  const filteredRequests = useMemo(
    () => requests.filter((request) => filter === "ALL" || request.request_status === filter),
    [filter, requests],
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Visão operacional</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">Painel administrativo</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Acompanhe clientes conectados e trate solicitações de privacidade com acesso mínimo aos dados.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas administrativas">
        <MetricCard
          label="Online agora"
          value={onlineClients}
          detail={presenceConnected ? "Atualização em tempo real" : "Conectando ao tempo real..."}
          icon={Activity}
          live
        />
        <MetricCard
          label="Com sessão ativa"
          value={metrics.active_session_clients}
          detail="Podem não estar com o app aberto"
          icon={UserRoundCheck}
        />
        <MetricCard label="Clientes cadastrados" value={metrics.total_clients} detail="Contas não excluídas" icon={Users} />
        <MetricCard
          label="Solicitações pendentes"
          value={metrics.open_requests + metrics.processing_requests}
          detail={`${metrics.open_requests} abertas · ${metrics.processing_requests} em atendimento`}
          icon={Clock3}
        />
      </section>

      <section className="space-y-4" aria-labelledby="request-queue-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="request-queue-heading" className="font-display text-2xl tracking-tight">Fila de solicitações</h2>
            <p className="mt-1 text-sm text-muted-foreground">Novas solicitações aparecem automaticamente.</p>
          </div>
          <label className="grid gap-1 text-sm font-medium sm:w-52">
            Filtrar por status
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as Filter)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        {filteredRequests.length > 0 ? (
          <div className="grid gap-4">
            {filteredRequests.map((request) => <RequestCard key={request.request_id} request={request} />)}
          </div>
        ) : (
          <EmptyState title="Nenhuma solicitação neste filtro" description="A fila será atualizada quando houver uma nova solicitação." />
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  live = false,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Activity;
  live?: boolean;
}) {
  return (
    <article className="rounded-3xl bg-card p-5 ring-1 ring-border">
      <div className="flex items-center justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-foreground">
          <Icon className="size-4" aria-hidden />
        </span>
        {live ? <CircleDot className="size-4 text-success" aria-label="Ao vivo" /> : null}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-4xl tracking-tight tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
    </article>
  );
}

function RequestCard({ request }: { request: AdminPrivacyRequest }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [response, setResponse] = useState(request.response_message ?? "");
  const lockedResponse = request.delivery_status === "FAILED" || request.delivery_status === "PENDING";
  const finished = request.request_status === "COMPLETED" || request.request_status === "REJECTED";

  function startRequest() {
    const formData = new FormData();
    formData.set("requestId", request.request_id);
    startTransition(async () => {
      const result = await startPrivacyRequestAction(formData);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Atendimento iniciado.");
      router.refresh();
    });
  }

  function sendResponse(resolution: AdminResolution) {
    const formData = new FormData();
    formData.set("requestId", request.request_id);
    formData.set("resolution", resolution);
    formData.set("response", response);
    startTransition(async () => {
      const result = await respondPrivacyRequestAction(formData);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Resposta enviada por e-mail.");
      router.refresh();
    });
  }

  return (
    <article className="rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={request.request_status} />
            <span className="text-xs text-muted-foreground">{TYPE_LABELS[request.request_type] ?? request.request_type}</span>
          </div>
          <h3 className="mt-3 font-display text-xl tracking-tight">{request.customer_name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Recebida em {formatDate(request.request_created_at)}</p>
        </div>
        {request.assigned_to_current_admin && !finished ? (
          <Badge variant="secondary">Atribuída a você</Badge>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
        {request.request_message || "Sem mensagem."}
      </div>

      {request.request_status === "OPEN" ? (
        <Button onClick={startRequest} disabled={pending} className="mt-4 h-10 rounded-xl">
          {pending ? <RefreshCw className="size-4 animate-spin" aria-hidden /> : <Clock3 className="size-4" aria-hidden />}
          Iniciar atendimento
        </Button>
      ) : null}

      {request.request_status === "PROCESSING" ? (
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          <Field
            label={lockedResponse ? "Resposta salva para reenvio" : "Resposta por e-mail"}
            htmlFor={`response-${request.request_id}`}
            hint={lockedResponse ? "Para evitar duplicidade, uma tentativa deve reenviar exatamente a mesma resposta." : "O e-mail do cliente é usado somente pelo servidor e não aparece neste painel."}
          >
            <Textarea
              id={`response-${request.request_id}`}
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              readOnly={lockedResponse}
              minLength={8}
              maxLength={4000}
              className="min-h-28 resize-y rounded-2xl"
            />
          </Field>
          {request.delivery_status === "FAILED" ? (
            <p className="text-sm text-danger">O último envio falhou. A solicitação continua em atendimento.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {lockedResponse && request.response_resolution ? (
              <Button onClick={() => sendResponse(request.response_resolution as AdminResolution)} disabled={pending} className="h-10 rounded-xl">
                <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} aria-hidden />
                Tentar enviar novamente
              </Button>
            ) : (
              <>
                <Button onClick={() => sendResponse("COMPLETED")} disabled={pending} className="h-10 rounded-xl">
                  <Send className="size-4" aria-hidden />
                  Concluir e enviar
                </Button>
                <Button onClick={() => sendResponse("REJECTED")} disabled={pending} variant="destructive" className="h-10 rounded-xl">
                  <XCircle className="size-4" aria-hidden />
                  Rejeitar e enviar
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {finished && request.response_message ? (
        <div className="mt-5 border-t border-border pt-5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <MailCheck className="size-4 text-success" aria-hidden />
            Resposta enviada {request.response_sent_at ? `em ${formatDate(request.response_sent_at)}` : "por e-mail"}
          </p>
          <p className="mt-2 rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground whitespace-pre-wrap">
            {request.response_message}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const Icon = status === "COMPLETED" ? CheckCircle2 : status === "REJECTED" ? XCircle : Clock3;
  return (
    <Badge variant={status === "REJECTED" ? "destructive" : status === "OPEN" ? "outline" : "secondary"}>
      <Icon className="size-3" aria-hidden />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
