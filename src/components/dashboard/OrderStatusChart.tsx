"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface OrderStatusChartProps {
  data: { status: string; count: number }[];
}

const COLORS = {
  PENDING: "#eab308",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: { name?: string; percent?: number }) =>
            percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name as keyof typeof COLORS]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value, "Orders"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
