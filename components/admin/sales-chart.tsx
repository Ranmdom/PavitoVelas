"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface SalesChartProps {
  data: { date: string; total: number }[]
}

export default function SalesChart({ data }: SalesChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Transforma [{ date: "2025-05-01", total: 1200 }, …]
  // em [{ name: "01/05", vendas: 1200 }, …]
  const chartData = data.map(({ date, total }) => ({
    name: date.split("-").reverse().join("/").slice(0, 5),
    vendas: total,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4847B20" />
        <XAxis
          dataKey="name"
          stroke="#631C21"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#631C21"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />
        <Tooltip
          formatter={(value) => [`R$ ${value}`, "Vendas"]}
          contentStyle={{
            backgroundColor: "white",
            borderColor: "#F4847B40",
            borderRadius: "0.375rem",
          }}
        />
        <Bar dataKey="vendas" fill="#882335" radius={[4, 4, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}
