"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

export function StockReuseReport() {
  const data = {
    labels: ["Reutilizado de bodega", "Comprado nuevo"],
    datasets: [
      {
        data: [68, 32],
        backgroundColor: ["hsl(var(--chart-2))", "hsl(var(--chart-5))"],
        borderWidth: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed}%`,
        },
      },
    },
  }

  const handleExport = () => {
    const csv = [
      ["Categoría", "Porcentaje"],
      ["Reutilizado de bodega", "68"],
      ["Comprado nuevo", "32"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reutilizacion-stock-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reutilización de stock</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <Doughnut data={data} options={options} />
        </div>
        <div className="mt-4 p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            El 68% de los materiales utilizados en cursos provienen de stock existente, generando un ahorro
            significativo en compras.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

