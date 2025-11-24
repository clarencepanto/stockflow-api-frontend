"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StockLevelsChartProps {
  data: { name: string; stockLevel: number; lowStockThreshold: number }[];
}

export function StockLevelsChart({ data }: StockLevelsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="name"
          stroke="#64748b"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip
          formatter={(value: number, name: string) => [value, "Stock Level"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
          }}
        />
        <Bar dataKey="stockLevel" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.stockLevel <= entry.lowStockThreshold
                  ? "#ef4444"
                  : "#3b82f6"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
