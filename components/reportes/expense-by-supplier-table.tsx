"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { apiSimulada } from "@/lib/mock"
import type { Factura } from "@/lib/types"

type TotalesProveedor = {
  proveedor: string
  gastos: number
  facturas: number
}

export function ExpenseBySupplierTable() {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [monthFilter, setMonthFilter] = useState("") // yyyy-mm

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await apiSimulada.getFacturas()
      setFacturas(data)
      setLoading(false)
    }
    load()
    const handler = (evt: Event) => {
      const detalle = (evt as CustomEvent).detail
      if (detalle === "facturas" || detalle === "facturasGenerales") {
        load()
      }
    }
    window.addEventListener("demo-data-update", handler as EventListener)
    return () => window.removeEventListener("demo-data-update", handler as EventListener)
  }, [])

  const data = useMemo<TotalesProveedor[]>(() => {
    const filtered = facturas.filter((f) => {
      if (!monthFilter) return true
      const [y, m] = monthFilter.split("-").map(Number)
      const d = new Date(f.fechaEmisionISO)
      return d.getFullYear() === y && d.getMonth() + 1 === m
    })
    const grouped = filtered.reduce<Record<string, TotalesProveedor>>((acc, f) => {
      const key = f.proveedor || "Sin proveedor"
      if (!acc[key]) acc[key] = { proveedor: key, gastos: 0, facturas: 0 }
      acc[key].gastos += f.montoCLP || 0
      acc[key].facturas += 1
      return acc
    }, {})
    return Object.values(grouped)
  }, [facturas, monthFilter])

  const totales = useMemo(
    () => data.reduce((acc, r) => ({ gastos: acc.gastos + r.gastos, facturas: acc.facturas + r.facturas }), { gastos: 0, facturas: 0 }),
    [data],
  )

  const handleExport = () => {
    const rows = [["Proveedor", "Gastos (CLP)", "Facturas"], ...data.map((row) => [row.proveedor, row.gastos, row.facturas])]
    const csv = rows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gastos-por-proveedor-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>Gastos por proveedor</CardTitle>
          <p className="text-sm text-muted-foreground">Basado en facturas ingresadas</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Gastos totales</TableHead>
                <TableHead className="text-right">Facturas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No hay facturas en el periodo seleccionado
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {data.map((row) => (
                    <TableRow key={row.proveedor}>
                      <TableCell className="font-medium">{row.proveedor}</TableCell>
                      <TableCell className="text-right font-mono">${row.gastos.toLocaleString("es-CL")}</TableCell>
                      <TableCell className="text-right">{row.facturas}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right font-mono">${totales.gastos.toLocaleString("es-CL")}</TableCell>
                    <TableCell className="text-right">{totales.facturas}</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
