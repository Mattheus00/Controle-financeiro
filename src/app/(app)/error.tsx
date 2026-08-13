"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-3xl bg-card p-8 ring-1 ring-border">
      <h1 className="font-display text-3xl">Algo saiu do lugar</h1>
      <p className="mt-2 text-muted-foreground">Tente de novo. Se persistir, recarregue a página.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Tentar novamente
      </button>
    </div>
  );
}
