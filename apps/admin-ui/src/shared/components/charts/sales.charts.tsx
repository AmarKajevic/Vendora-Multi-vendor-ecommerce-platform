"use client"

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const salesData = [
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 18200 },
  { month: "Mar", revenue: 15600 },
  { month: "Apr", revenue: 24100 },
  { month: "May", revenue: 21900 },
  { month: "Jun", revenue: 28700 },
  { month: "Jul", revenue: 33400 },
  { month: "Aug", revenue: 29800 },
  { month: "Sep", revenue: 36200 },
  { month: "Oct", revenue: 39100 },
  { month: "Nov", revenue: 42500 },
  { month: "Dec", revenue: 47800 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SalesChart() {
  const total = useMemo(
    () => salesData.reduce((acc, item) => acc + item.revenue, 0),
    [],
  );

  const average = useMemo(() => total / salesData.length, [total]);

  const growth = useMemo(() => {
    const first = salesData[0]!.revenue;
    const last = salesData[salesData.length - 1]!.revenue;
    return Math.round(((last - first) / first) * 100);
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Total Revenue" value={formatCurrency(total)} change="+12.5%" />
        <MetricCard title="Monthly Average" value={formatCurrency(average)} change="+8.2%" />
        <MetricCard title="YoY Growth" value={`${growth}%`} change="+24%" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0];
                    if (!item || item.value === undefined) return null;
                    const value = item.value as number;
                    const month = item.payload?.month as string;
                    return (
                      <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                        <div className="font-medium text-foreground">{month}</div>
                        <div className="text-muted-foreground">
                          Revenue: {" "}
                          <span className="font-mono font-medium text-foreground">
                            {formatCurrency(value)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  activeDot={{ r: 5, fill: "var(--color-chart-1)", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, change }: { title: string; value: string; change: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        <div className="mt-1 text-xs font-medium text-chart-2">{change} from last period</div>
      </CardContent>
    </Card>
  );
}
