"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function TransactionFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/transactions?${next.toString()}`);
  }

  return (
    <form className="grid gap-3 rounded-3xl bg-card p-4 ring-1 ring-border md:grid-cols-4" onSubmit={(event) => event.preventDefault()}>
      <Input
        name="q"
        placeholder="Buscar"
        defaultValue={params.get("q") ?? ""}
        className="h-11"
        onBlur={(event) => update("q", event.target.value)}
      />
      <select
        className="h-11 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        defaultValue={params.get("type") ?? ""}
        onChange={(event) => update("type", event.target.value)}
        aria-label="Tipo"
      >
        <option value="">Todos</option>
        <option value="expense">Despesa</option>
        <option value="income">Receita</option>
        <option value="transfer">Transferência</option>
      </select>
      <Input type="date" defaultValue={params.get("from") ?? ""} className="h-11" onChange={(event) => update("from", event.target.value)} aria-label="De" />
      <Input type="date" defaultValue={params.get("to") ?? ""} className="h-11" onChange={(event) => update("to", event.target.value)} aria-label="Até" />
    </form>
  );
}
