"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export function MovementsChart() {
  const data = {
    labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    datasets: [
      {
        label: "Entradas",
        data: [12, 19, 8, 15, 22, 8, 5],
        borderColor: "hsl(var(--chart-2))",
        backgroundColor: "hsla(var(--chart-2) / 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Salidas",
        data: [8, 11, 13, 9, 16, 12, 7],
        borderColor: "hsl(var(--chart-1))",
        backgroundColor: "hsla(var(--chart-1) / 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos semanales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

