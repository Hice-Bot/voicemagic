"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Zap, Mic2, Key, DollarSign, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function formatMonth(iso: string) {
  const [year, month] = iso.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleString("en-US", { month: "short", year: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric" });
}

export function AdminOverviewView() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.admin.getOverview.queryOptions());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Users" value={data?.totalUsers ?? 0} icon={Users} loading={isLoading} />
        <StatCard title="Generations" value={data?.totalGenerations ?? 0} icon={Zap} loading={isLoading} />
        <StatCard title="Cloned Voices" value={data?.totalVoices ?? 0} icon={Mic2} loading={isLoading} />
        <StatCard title="API Keys" value={data?.totalApiKeys ?? 0} icon={Key} loading={isLoading} />
        <StatCard
          title="Total Revenue"
          value={data ? formatMoney(data.totalRevenueCents) : "$0"}
          icon={DollarSign}
          loading={isLoading}
        />
        <StatCard
          title="Active Subs"
          value={data?.activeSubscriptions ?? 0}
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Generations — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ChartContainer
                config={{ count: { label: "Generations", color: "hsl(var(--primary))" } }}
                className="h-48 w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.generationsPerDay ?? []}>
                    <defs>
                      <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      fill="url(#genGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue by month</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (data?.revenueByMonth?.length ?? 0) === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No revenue data yet
              </div>
            ) : (
              <ChartContainer
                config={{ amount: { label: "Revenue (USD)", color: "hsl(var(--primary))" } }}
                className="h-48 w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.revenueByMonth ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonth}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `$${(v / 100).toFixed(0)}`}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(v: unknown) => formatMoney(v as number)} />}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
