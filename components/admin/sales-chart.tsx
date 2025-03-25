"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// Dados de exemplo para o gráfico
const data = [
  { name: "01/05", vendas: 1200 },
  { name: "02/05", vendas: 900 },
  { name: "03/05", vendas: 1500 },
  { name: "04/05", vendas: 1800 },
  { name: "05/05", vendas: 1200 },
  { name: "06/05", vendas: 600 },
  { name: "07/05", vendas: 1100 },
  { name: "08/05", vendas: 1400 },
  { name: "09/05", vendas: 1600 },
  { name: "10/05", vendas: 1800 },
  { name: "11/05", vendas: 2000 },
  { name: "12/05", vendas: 1700 },
  { name: "13/05", vendas: 1300 },
  { name: "14/05", vendas: 1900 },
]

export default function SalesChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4847B20" />
        <XAxis dataKey="name" stroke="#631C21" fontSize={12} tickLine={false} axisLine={false} />
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

