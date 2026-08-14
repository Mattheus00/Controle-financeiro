"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function DateFilter({
  label,
  name,
  defaultValue,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className={cn(
        "flex h-11 min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
      )}
    >
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <Input
        id={name}
        name={name}
        type="date"
        defaultValue={defaultValue}
        aria-label={label}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

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
    <form
      className="grid gap-3 rounded-3xl bg-card p-4 ring-1 ring-border sm:grid-cols-2 md:grid-cols-4"
      onSubmit={(event) => event.preventDefault()}
    >
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
      <DateFilter
        label="De"
        name="from"
        defaultValue={params.get("from") ?? ""}
        onChange={(value) => update("from", value)}
      />
      <DateFilter
        label="Até"
        name="to"
        defaultValue={params.get("to") ?? ""}
        onChange={(value) => update("to", value)}
      />
    </form>
  );
}
