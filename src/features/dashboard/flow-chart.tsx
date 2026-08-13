"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/lib/money";

export function FlowChart({
  data,
}: {
  data: Array<{ date: string; income: number; expense: number }>;
}) {
  const chartData = data.map((row) => ({
    ...row,
    label: row.date.slice(8, 10),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
          <YAxis hide />
          <Tooltip
            formatter={(value) => formatBRL(Number(value ?? 0))}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
          />
          <Area type="monotone" dataKey="income" stroke="var(--success)" fill="var(--success)" fillOpacity={0.18} />
          <Area type="monotone" dataKey="expense" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.12} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
