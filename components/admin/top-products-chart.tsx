"use client"

import { useEffect, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

// Dados de exemplo para o gráfico
const data = [
  { name: "Vela Pêssego & Baunilha", value: 35 },
  { name: "Vela Lavanda & Bergamota", value: 25 },
  { name: "Vela Madeira & Âmbar", value: 20 },
  { name: "Vela Vanilla & Canela", value: 15 },
  { name: "Vela Limão & Manjericão", value: 5 },
]

// Cores para o gráfico
const COLORS = ["#631C21", "#882335", "#F4847B", "#F1889C", "#D36A6A"]

export default function TopProductsChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} unidades`, "Vendas"]}
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

