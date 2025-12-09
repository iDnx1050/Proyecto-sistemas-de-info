"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function ExpenseByCourseReport() {
  const data = {
    labels: ["Primeros Auxilios Básicos", "Prev. Riesgos Laborales", "Evacuación y Emergencias"],
    datasets: [
      {
        label: "Gastos totales (CLP)",
        data: [450000, 380000, 520000],
        backgroundColor: "hsl(var(--chart-1))",
        borderRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toLocaleString("es-CL")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${(value / 1000).toFixed(0)}k`,
        },
        grid: {
          color: "hsl(var(--border))",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const handleExport = () => {
    const csv = [
      ["Curso", "Gastos (CLP)"],
      ["Primeros Auxilios Básicos", "450000"],
      ["Prev. Riesgos Laborales", "380000"],
      ["Evacuación y Emergencias", "520000"],
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gastos-por-curso-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gastos por curso</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

