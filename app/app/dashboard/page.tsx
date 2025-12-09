"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, AlertTriangle, PackagePlus } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { ExpenseChart } from "@/components/dashboard/expense-chart"
import { ConsumptionChart } from "@/components/dashboard/consumption-chart"
import { InvoiceRegistry } from "@/components/dashboard/invoice-registry"
import { es } from "@/lib/i18n/es"
import { apiSimulada } from "@/lib/mock"
import type { Curso, Inventario, Movimiento } from "@/lib/types"

type VistaDetalle = "courses" | "supplies" | "inbound" | null

export default function DashboardPage() {
  const [detalleAbierto, setDetalleAbierto] = useState<VistaDetalle>(null)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [insumosCriticos, setInsumosCriticos] = useState<Inventario[]>([])
  const [ingresosStock, setIngresosStock] = useState<Movimiento[]>([])
  const [indiceInventario, setIndiceInventario] = useState<Record<string, string>>({})
  const [cargandoDetalle, setCargandoDetalle] = useState(true)
  const [ingresosMes, setIngresosMes] = useState(0)
  const [porcentajeCursosActivos, setPorcentajeCursosActivos] = useState<string>("0%")
  const [resumenCursosActivos, setResumenCursosActivos] = useState<string>("0 de 0 cursos activos")

  useEffect(() => {
    async function cargarDetalle() {
      const [datosCursos, datosInventario, datosMovimientos] = await Promise.all([
        apiSimulada.getCursos(),
        apiSimulada.getInventario(),
        apiSimulada.getMovimientos(),
      ])

      setCursos(datosCursos)

      const bajoStock = datosInventario.filter((item) => item.stock <= item.stockMin)
      setInsumosCriticos(bajoStock)

      setIndiceInventario(
        datosInventario.reduce((acumulador, item) => {
          acumulador[item.sku] = item.nombre
          return acumulador
        }, {} as Record<string, string>),
      )

      const entradas = datosMovimientos.filter((item) => item.tipo === "entrada").slice(0, 6)
      setIngresosStock(entradas)
      const hoy = new Date()
      const totalEntradasMes = datosMovimientos
        .filter(
          (mov) =>
            mov.tipo === "entrada" &&
            new Date(mov.fechaISO).getMonth() === hoy.getMonth() &&
            new Date(mov.fechaISO).getFullYear() === hoy.getFullYear(),
        )
        .reduce((acc, mov) => acc + mov.cantidad, 0)
      setIngresosMes(totalEntradasMes)

      const activos = datosCursos.filter((c) => c.activo).length
      const totalCursos = datosCursos.length
      const porcentaje = totalCursos > 0 ? `${Math.round((activos / totalCursos) * 100)}%` : "0%"
      setPorcentajeCursosActivos(porcentaje)
      setResumenCursosActivos(`${activos} de ${totalCursos} cursos activos`)

      setCargandoDetalle(false)
    }

    cargarDetalle()
  }, [])

  const detalles = {
    courses: {
      titulo: es.dashboard.kpis.checklistComplete,
      descripcion: "Detalle de los cursos activos y su checklist.",
    },
    supplies: {
      titulo: es.dashboard.kpis.stockAlerts,
      descripcion: "Insumos que estan en o bajo su stock minimo.",
    },
    inbound: {
      titulo: es.dashboard.kpis.stockInbound,
      descripcion: "Ultimas entradas registradas en bodega.",
    },
  }

  const formatearFecha = (iso: string) =>
    new Date(iso).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
    })

  const contenidoDetalle = () => {
    if (!detalleAbierto) return null
    if (cargandoDetalle) {
      return <p className="text-sm text-muted-foreground">Cargando detalle...</p>
    }

    if (detalleAbierto === "courses") {
      if (cursos.length === 0) {
        return <p className="text-sm text-muted-foreground">No hay cursos registrados.</p>
      }

      return (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {cursos.map((curso) => (
            <Link
              key={curso.id}
              href={`/app/cursos/${curso.id}`}
              className="flex items-start justify-between rounded-lg border bg-white/80 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#5F7F32]/30 hover:shadow-md"
            >
              <div className="space-y-1 pr-3">
                <p className="font-semibold text-[#5F7F32]">{curso.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {curso.tipo} - {formatearFecha(curso.fechaISO)} - {curso.lugar}
                </p>
                <p className="text-xs text-muted-foreground">Responsable: {curso.responsable}</p>
              </div>
              <Badge
                variant={curso.activo ? "secondary" : "outline"}
                className={curso.activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : undefined}
              >
                {curso.activo ? "Activo" : "Inactivo"}
              </Badge>
            </Link>
          ))}
        </div>
      )
    }

    if (detalleAbierto === "supplies") {
      if (insumosCriticos.length === 0) {
        return <p className="text-sm text-muted-foreground">No hay insumos criticos por ahora.</p>
      }

      return (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {insumosCriticos.map((insumo) => (
            <Link
              key={insumo.sku}
              href="/app/inventario"
              className="flex items-start justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
            >
              <div className="space-y-1 pr-3">
                <p className="font-semibold text-[#92400E]">{insumo.nombre}</p>
                <p className="text-xs text-muted-foreground">SKU: {insumo.sku}</p>
                <p className="text-xs text-muted-foreground">Stock minimo: {insumo.stockMin}</p>
                {insumo.ubicacion && <p className="text-xs text-muted-foreground">Ubicacion: {insumo.ubicacion}</p>}
              </div>
              <div className="text-right space-y-1">
                <Badge variant="destructive" className="bg-transparent text-[#92400E] border-amber-300">
                  Stock {insumo.stock}
                </Badge>
                <p className="text-[11px] text-muted-foreground">Actualizado {formatearFecha(insumo.updatedAtISO)}</p>
              </div>
            </Link>
          ))}
        </div>
      )
    }

    if (detalleAbierto === "inbound") {
      if (ingresosStock.length === 0) {
        return <p className="text-sm text-muted-foreground">No hay ingresos de stock registrados este mes.</p>
      }

      return (
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {ingresosStock.map((movimiento) => (
            <div
              key={movimiento.id}
              className="flex items-start justify-between rounded-lg border bg-slate-50 px-4 py-3 shadow-sm"
            >
              <div className="space-y-1 pr-3">
                <p className="font-semibold text-[#5F7F32]">+{movimiento.cantidad} unidades</p>
                <p className="text-xs text-muted-foreground">
                  {indiceInventario[movimiento.sku] || `SKU ${movimiento.sku}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatearFecha(movimiento.fechaISO)} - Ref: {movimiento.referencia || "Sin referencia"}
                </p>
              </div>
              <div className="text-right space-y-1">
                <Badge variant="secondary" className="bg-[#EAF2E0] text-[#5F7F32] border-[#CFDFB8]">
                  Entrada
                </Badge>
                <p className="text-[11px] text-muted-foreground">Usuario: {movimiento.usuario}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <div className="p-6 space-y-6 bg-[#F9FAFB]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{es.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1">Resumen general del sistema logistico</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          titulo={es.dashboard.kpis.checklistComplete}
          valor={porcentajeCursosActivos}
          descripcion={resumenCursosActivos}
          icono={CheckCircle2}
          onClick={() => setDetalleAbierto("courses")}
        />
        <KpiCard
          titulo={es.dashboard.kpis.stockAlerts}
          valor={cargandoDetalle ? "-" : insumosCriticos.length}
          descripcion="Requieren atencion"
          icono={AlertTriangle}
          onClick={() => setDetalleAbierto("supplies")}
        />
        <KpiCard
          titulo={es.dashboard.kpis.stockInbound}
          valor={cargandoDetalle ? "-" : ingresosMes}
          descripcion="Ingresos de stock este mes"
          icono={PackagePlus}
          onClick={() => setDetalleAbierto("inbound")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ExpenseChart />
        <ConsumptionChart />
      </div>

      <div className="grid gap-6">
        <InvoiceRegistry />
      </div>

      <Dialog open={Boolean(detalleAbierto)} onOpenChange={(abierto) => (!abierto ? setDetalleAbierto(null) : undefined)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detalleAbierto ? detalles[detalleAbierto].titulo : ""}</DialogTitle>
            <DialogDescription>{detalleAbierto ? detalles[detalleAbierto].descripcion : ""}</DialogDescription>
          </DialogHeader>
          {contenidoDetalle()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
