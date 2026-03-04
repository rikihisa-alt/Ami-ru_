"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PrismCard } from "@/components/ui/prism-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatYen } from "@/lib/utils/currency";
import { TrendingUp } from "lucide-react";

interface BalanceChartProps {
  data: { date: string; balance: number }[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  // label is the day string from XAxis (e.g. "5")
  // payload[0].value is the balance
  const date = label;
  const balance = payload[0].value;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{date}日</p>
      <p
        className={`text-sm font-bold ${
          balance >= 0
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }`}
      >
        {formatYen(balance)}
      </p>
    </div>
  );
}

export function BalanceChart({ data }: BalanceChartProps) {
  if (data.length < 2) {
    return (
      <PrismCard variant="flat" animationIndex={3}>
        <EmptyState
          icon={TrendingUp}
          title="データが不足しています"
          description="収支データが2日以上あるとグラフが表示されます"
          className="py-8"
        />
      </PrismCard>
    );
  }

  // Extract day number for the XAxis
  const chartData = data.map((d) => ({
    ...d,
    day: String(parseInt(d.date.split("-")[2], 10)),
  }));

  return (
    <PrismCard variant="flat" animationIndex={3} className="pb-2">
      <p className="mb-3 text-sm font-semibold">残高推移</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(142, 76%, 36%)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(142, 76%, 36%)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(v: number) =>
              v >= 10000 || v <= -10000
                ? `${Math.round(v / 10000)}万`
                : v >= 1000 || v <= -1000
                  ? `${Math.round(v / 1000)}k`
                  : String(v)
            }
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(142, 76%, 36%)"
            strokeWidth={2}
            fill="url(#balanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </PrismCard>
  );
}
