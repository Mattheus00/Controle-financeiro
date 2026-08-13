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
    <div className="h-52 w-full min-w-0 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            stroke="var(--muted-foreground)"
            interval="preserveStartEnd"
            minTickGap={16}
            tickMargin={8}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value) => formatBRL(Number(value ?? 0))}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
            allowEscapeViewBox={{ x: false, y: true }}
            contentStyle={{
              borderRadius: 16,
              fontSize: 12,
              maxWidth: 220,
            }}
          />
          <Area type="monotone" dataKey="income" name="Entradas" stroke="var(--success)" fill="var(--success)" fillOpacity={0.18} />
          <Area type="monotone" dataKey="expense" name="Saídas" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.12} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
