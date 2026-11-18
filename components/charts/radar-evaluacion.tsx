"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export function RadarEvaluacion({ data }: { data: { eje: string; valor: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="hsl(240 5% 18%)" />
        <PolarAngleAxis
          dataKey="eje"
          tick={{ fill: "hsl(240 5% 62%)", fontSize: 11 }}
        />
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
        <Radar
          name="Evaluación"
          dataKey="valor"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.28}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(240 8% 7%)",
            border: "1px solid hsl(240 5% 18%)",
            borderRadius: "8px",
            fontSize: 12,
            color: "hsl(0 0% 98%)",
          }}
          formatter={(value: number) => [`${value.toFixed(2)} / 5`, "Promedio"]}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
