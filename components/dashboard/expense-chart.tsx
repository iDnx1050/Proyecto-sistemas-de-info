"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import "@/lib/chart-config"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { apiSimulada } from "@/lib/mock"
import type { Curso, Factura } from "@/lib/types"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const colores = ["#1E3A5F", "#3B7C7C", "#D9A441", "#16A34A"]
const labelsCurso = ["Primeros Auxilios", "Prevención de Riesgos", "Evacuación", "Otro"]

const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const encontrarLabel = (tipo?: string) => {
  if (!tipo) return "Otro"
  const limpio = normalizar(tipo)
  const match = labelsCurso.find((label) => normalizar(label) === limpio)
  return match ?? "Otro"
}

export function ExpenseChart() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      const [facturasApi, cursosApi] = await Promise.all([apiSimulada.getFacturas(), apiSimulada.getCursos()])
      if (!activo) return
      setFacturas(facturasApi)
      setCursos(cursosApi)
      setCargando(false)
    }

    cargar()

    const handler = (evt: Event) => {
      const detalle = (evt as CustomEvent).detail
      if (detalle === "facturas") {
        cargar()
      }
    }
    window.addEventListener("demo-data-update", handler as EventListener)

    return () => {
      activo = false
      window.removeEventListener("demo-data-update", handler as EventListener)
    }
  }, [])

  useEffect(() => {
    const handler = (evt: Event) => {
      const detalle = (evt as CustomEvent).detail
      if (detalle === "inventario" || detalle === "movimientos") {
        Promise.all([apiSimulada.getFacturas(), apiSimulada.getCursos()]).then(([facturasApi, cursosApi]) => {
          setFacturas(facturasApi)
          setCursos(cursosApi)
        })
      }
    }
    window.addEventListener("demo-data-update", handler as EventListener)
    return () => window.removeEventListener("demo-data-update", handler as EventListener)
  }, [])

  const { datos, tieneDatos } = useMemo(() => {
    if (!facturas.length || !cursos.length) {
      return { datos: null, tieneDatos: false }
    }

    const mapaCursoTipo = cursos.reduce<Record<string, string>>((acc, curso) => {
      acc[curso.id] = encontrarLabel(curso.tipo)
      return acc
    }, {})

    const totales = labelsCurso.reduce<Record<string, number>>((acc, label) => {
      acc[label] = 0
      return acc
    }, {})

    facturas.forEach((factura) => {
      const label = mapaCursoTipo[factura.cursoId] || "Otro"
      totales[label] = (totales[label] || 0) + (factura.montoCLP || 0)
    })

    const data = {
      labels: labelsCurso,
      datasets: [
        {
          label: "Gastos (CLP)",
          data: labelsCurso.map((l) => totales[l] || 0),
          backgroundColor: colores,
          borderRadius: 8,
        },
      ],
    }

    const hasData = Object.values(totales).some((monto) => monto > 0)
    return { datos: data, tieneDatos: hasData }
  }, [facturas, cursos])

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#f8fafc",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#cbd5e1",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
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
          color: "#e2e8f0",
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
        <CardTitle>Gastos por tipo de curso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {cargando ? (
            <p className="text-sm text-muted-foreground">Cargando datos...</p>
          ) : tieneDatos && datos ? (
            <Bar data={datos} options={opciones} />
          ) : (
            <div className="text-sm text-muted-foreground flex h-full items-center">
              Aún no hay facturas registradas para mostrar en el gráfico.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
