"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { apiSimulada } from "@/lib/mock"
import type { Inventario } from "@/lib/types"

export function StockAlerts() {
  const [insumosBajoStock, setInsumosBajoStock] = useState<Inventario[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargarDatos() {
      const items = await apiSimulada.getInventario()
      const alertas = items.filter((item) => item.stock <= item.stockMin)
      setInsumosBajoStock(alertas)
      setCargando(false)
    }
    cargarDatos()
  }, [])

  if (cargando) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Alertas de stock bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Alertas de stock bajo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insumosBajoStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay alertas de stock en este momento</p>
        ) : (
          <div className="space-y-3">
            {insumosBajoStock.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.nombre}</p>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="shrink-0">
                    {item.stock} / {item.stockMin}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

