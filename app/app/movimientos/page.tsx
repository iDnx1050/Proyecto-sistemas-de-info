"use client"

import { useEffect, useState } from "react"
import { ArrowUpCircle, ArrowDownCircle, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { apiSimulada } from "@/lib/mock"
import type { Movimiento } from "@/lib/types"
import { format } from "date-fns"
import { es as dateFnsEs } from "date-fns/locale"
import { es } from "@/lib/i18n/es"

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [filteredMovimientos, setFilteredMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoFilter, setTipoFilter] = useState<"todos" | "entrada" | "salida">("todos")
  const [monthFilter, setMonthFilter] = useState<string>("")

  const loadMovimientos = async () => {
    setLoading(true)
    const data = await apiSimulada.getMovimientos()
    setMovimientos(data)
    setFilteredMovimientos(data)
    setLoading(false)
  }

  useEffect(() => {
    loadMovimientos()
  }, [])

  useEffect(() => {
    const filtered = movimientos.filter((m) => {
      const matchesTipo = tipoFilter === "todos" ? true : m.tipo === tipoFilter
      if (!matchesTipo) return false

      if (!monthFilter) return true
      const date = new Date(m.fechaISO)
      const [year, month] = monthFilter.split("-").map(Number)
      return date.getFullYear() === year && date.getMonth() + 1 === month
    })
    setFilteredMovimientos(filtered)
  }, [tipoFilter, monthFilter, movimientos])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{es.movimientos.title}</h1>
        <p className="text-muted-foreground mt-1">Historial de entradas y salidas de inventario</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label>Tipo de movimiento</Label>
          <Select value={tipoFilter} onValueChange={(value: any) => setTipoFilter(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="salida">Salidas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Mes / año</Label>
          <Input
            type="month"
            className="w-[180px]"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{es.common.loading}</div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovimientos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay movimientos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovimientos.map((movimiento) => (
                  <TableRow key={movimiento.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(movimiento.fechaISO), "dd MMM yyyy, HH:mm", { locale: dateFnsEs })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {movimiento.tipo === "entrada" ? (
                        <Badge variant="default" className="gap-1">
                          <ArrowUpCircle className="w-3 h-3" />
                          Entrada
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <ArrowDownCircle className="w-3 h-3" />
                          Salida
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{movimiento.sku}</code>
                    </TableCell>
                    <TableCell className="font-mono font-medium">{movimiento.cantidad}</TableCell>
                    <TableCell>{movimiento.referencia || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{movimiento.usuario}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

