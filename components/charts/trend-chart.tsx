"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { PuntoTendencia } from "@/lib/analytics";

const tooltipStyle = {
  backgroundColor: "hsl(240 8% 7%)",
  border: "1px solid hsl(240 5% 18%)",
  borderRadius: "8px",
  fontSize: 12,
  color: "hsl(0 0% 98%)",
};

export function TrendChart({ data }: { data: PuntoTendencia[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gInst" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gRep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5% 14%)" vertical={false} />
        <XAxis dataKey="mes" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(240 5% 22%)" }} />
        <Legend wrapperStyle={{ fontSize: 11, color: "hsl(240 5% 60%)" }} />
        <Area
          type="monotone"
          dataKey="instalaciones"
          name="Instalaciones"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#gInst)"
        />
        <Area
          type="monotone"
          dataKey="reparaciones"
          name="Reparaciones"
          stroke="#22d3ee"
          strokeWidth={2}
          fill="url(#gRep)"
        />
        <Area
          type="monotone"
          dataKey="incumplimientos"
          name="Incumplimientos"
          stroke="#f87171"
          strokeWidth={1.5}
          fillOpacity={0}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
