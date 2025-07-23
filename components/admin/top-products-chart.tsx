"use client"

import { useEffect, useState } from "react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const COLORS = ["#631C21", "#882335", "#F4847B", "#F1889C", "#D36A6A"]

interface TopProductsChartProps {
  data: { name: string; count: number; percentage: number }[]
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Converte para o formato que o Recharts espera
  const chartData = data.map(({ name, count }) => ({
    name,
    value: count,
  }))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} unidades`, "Vendas"]}
            contentStyle={{
              backgroundColor: "white",
              borderColor: "#F4847B40",
              borderRadius: "0.375rem",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
