"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Doughnut } from "react-chartjs-2"
import "@/lib/chart-config"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { apiSimulada } from "@/lib/mock"
import type { Factura, FacturaGeneral } from "@/lib/types"

ChartJS.register(ArcElement, Tooltip, Legend)

const categorias = [
  { key: "alimentacion", label: "Alimentación", color: "#16A34A" },
  { key: "logistica", label: "Logística", color: "#1E3A5F" },
  { key: "indumentaria", label: "Indumentaria", color: "#3B7C7C" },
  { key: "materiales", label: "Material educativo", color: "#D9A441" },
  { key: "servicios", label: "Servicios", color: "#D97706" },
  { key: "otro", label: "Otros", color: "#10B981" },
]

export function ConsumptionChart() {
  const [facturas, setFacturas] = useState<FacturaGeneral[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      const [facturasGenerales, facturasCursos] = await Promise.all([
        apiSimulada.getFacturasGenerales(),
        apiSimulada.getFacturas(),
      ])
      const unificadas: FacturaGeneral[] = [
        ...facturasGenerales,
        ...facturasCursos.map(
          (f: Factura): FacturaGeneral => ({
            id: f.id,
            proveedor: f.proveedor,
            montoCLP: f.montoCLP,
            fechaEmisionISO: f.fechaEmisionISO,
            categoria: f.categoria,
            fileName: f.fileName,
            fileType: f.fileType,
            fileUrl: f.fileUrl,
            createdAtISO: f.createdAtISO,
          }),
        ),
      ]
      if (!activo) return
      setFacturas(unificadas)
      setCargando(false)
    }

    cargar()

    const handler = (evt: Event) => {
      const detalle = (evt as CustomEvent).detail
      if (detalle === "facturasGenerales") {
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
      if (["facturas", "facturasGenerales", "inventario", "movimientos"].includes(detalle)) {
        apiSimulada
          .getFacturasGenerales()
          .then((generales) =>
            apiSimulada.getFacturas().then((cursos) => {
              const unificadas: FacturaGeneral[] = [
                ...generales,
                ...cursos.map(
                  (f: Factura): FacturaGeneral => ({
                    id: f.id,
                    proveedor: f.proveedor,
                    montoCLP: f.montoCLP,
                    fechaEmisionISO: f.fechaEmisionISO,
                    categoria: f.categoria,
                    fileName: f.fileName,
                    fileType: f.fileType,
                    fileUrl: f.fileUrl,
                    createdAtISO: f.createdAtISO,
                  }),
                ),
              ]
              setFacturas(unificadas)
            }),
          )
          .catch(() => {})
      }
    }
    window.addEventListener("demo-data-update", handler as EventListener)
    return () => window.removeEventListener("demo-data-update", handler as EventListener)
  }, [])

  const { datos, tieneDatos } = useMemo(() => {
    if (!facturas.length) return { datos: null, tieneDatos: false }

    const totales = categorias.reduce<Record<string, number>>((acc, cat) => {
      acc[cat.key] = 0
      return acc
    }, {})

    facturas.forEach((f) => {
      const cat = f.categoria || "otro"
      totales[cat] = (totales[cat] || 0) + (f.montoCLP || 0)
    })

    const totalGeneral = Object.values(totales).reduce((acc, v) => acc + v, 0)
    const data = {
      labels: categorias.map((c) => c.label),
      datasets: [
        {
          data: categorias.map((c) => totales[c.key] || 0),
          backgroundColor: categorias.map((c) => c.color),
          borderWidth: 0,
        },
      ],
    }

    const hasData = totalGeneral > 0
    return { datos: data, tieneDatos: hasData }
  }, [facturas])

  const opciones = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "#f8fafc",
        titleColor: "#0f172a",
        bodyColor: "#0f172a",
        borderColor: "#cbd5e1",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const valor = context.parsed
            const total = context.dataset.data.reduce((acc: number, v: number) => acc + v, 0)
            const porcentaje = total ? Math.round((valor / total) * 100) : 0
            return `${context.label}: $${valor.toLocaleString("es-CL")} (${porcentaje}%)`
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consumo por categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          {cargando ? (
            <p className="text-sm text-muted-foreground">Cargando datos...</p>
          ) : tieneDatos && datos ? (
            <Doughnut data={datos} options={opciones} />
          ) : (
            <div className="text-sm text-muted-foreground">
              Aún no hay facturas registradas para mostrar en el gráfico.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
