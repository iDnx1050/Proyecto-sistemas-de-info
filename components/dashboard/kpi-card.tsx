"use client"

"use client"

import type { KeyboardEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TarjetaKpiProps {
  titulo: string
  valor: string | number
  descripcion?: string
  icono: LucideIcon
  tendencia?: {
    valor: number
    esPositiva: boolean
  }
  className?: string
  onClick?: () => void
}

export function KpiCard({ titulo, valor, descripcion, icono: Icono, tendencia, className, onClick }: TarjetaKpiProps) {
  const esInteractivo = Boolean(onClick)

  const manejarTecla = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault()
      onClick()
    }
  }

  return (
    <Card
      className={cn(
        "shadow-md hover:shadow-lg transition-all",
        esInteractivo &&
          "cursor-pointer hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5F7F32]",
        className,
      )}
      role={esInteractivo ? "button" : undefined}
      tabIndex={esInteractivo ? 0 : undefined}
      onClick={onClick}
      onKeyDown={esInteractivo ? manejarTecla : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{titulo}</CardTitle>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#5F7F32]/10">
          <Icono className="w-5 h-5 text-[#5F7F32]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">{valor}</div>
        {descripcion && <p className="text-xs text-muted-foreground mt-1">{descripcion}</p>}
        {tendencia && (
          <div className="flex items-center gap-1 mt-2">
            <span className={cn("text-xs font-medium", tendencia.esPositiva ? "text-[#22C55E]" : "text-[#EF4444]")}>
              {tendencia.esPositiva ? "+" : "-"} {Math.abs(tendencia.valor)}%
            </span>
            <span className="text-xs text-muted-foreground">vs mes anterior</span>
          </div>
        )}
        {esInteractivo && (
          <p className="text-xs font-semibold text-[#5F7F32] mt-3 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5F7F32]" aria-hidden />
            Ver detalle
          </p>
        )}
      </CardContent>
    </Card>
  )
}

