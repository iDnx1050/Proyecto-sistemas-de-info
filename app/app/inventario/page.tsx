"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Download, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InventarioFormDialog } from "@/components/inventario/inventario-form-dialog"
import { AdjustStockDialog } from "@/components/inventario/adjust-stock-dialog"
import { apiSimulada } from "@/lib/mock"
import type { Inventario } from "@/lib/types"
import { es } from "@/lib/i18n/es"
import { useToast } from "@/hooks/use-toast"

export default function InventarioPage() {
  const [items, setItems] = useState<Inventario[]>([])
  const [filteredItems, setFilteredItems] = useState<Inventario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Inventario | undefined>()
  const [adjustingItem, setAdjustingItem] = useState<Inventario | undefined>()
  const { toast } = useToast()

  const sortItems = (list: Inventario[]) => {
    return [...list].sort((a, b) => {
      const aLow = a.stock <= a.stockMin
      const bLow = b.stock <= b.stockMin
      if (aLow !== bLow) return aLow ? -1 : 1
      return a.stock - b.stock
    })
  }

  const loadItems = async () => {
    setLoading(true)
    const data = await apiSimulada.getInventario()
    const sorted = sortItems(data)
    setItems(sorted)
    setFilteredItems(sorted)
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = sortItems(
        items.filter(
          (item) =>
            item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ubicacion?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(items)
    }
  }, [searchQuery, items])

  const handleEdit = (item: Inventario) => {
    setEditingItem(item)
    setFormDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingItem(undefined)
    setFormDialogOpen(true)
  }

  const handleAdjust = (item: Inventario) => {
    setAdjustingItem(item)
    setAdjustDialogOpen(true)
  }

  const handleDelete = async (item: Inventario) => {
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm(`¿Eliminar el item ${item.nombre} (${item.sku}) del inventario?`)
        : true
    if (!confirmed) return
    try {
      const ok = await apiSimulada.deleteInventarioItem(item.sku)
      if (ok) {
        toast({ title: "Item eliminado", description: `Se eliminó ${item.sku} del inventario.` })
        loadItems()
      } else {
        toast({ title: "No se pudo eliminar", description: "Intenta nuevamente.", variant: "destructive" })
      }
    } catch (error: any) {
      toast({
        title: "Error al eliminar",
        description: error?.message || "Ocurrió un problema al eliminar el item.",
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = () => {
    const headers = ["SKU", "Nombre", "Talla", "Color", "Stock", "Stock Mínimo", "Ubicación"]
    const rows = filteredItems.map((item) => [
      item.sku,
      item.nombre,
      item.talla || "",
      item.color || "",
      item.stock,
      item.stockMin,
      item.ubicacion || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `inventario-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{es.inventario.title}</h1>
          <p className="text-muted-foreground mt-1">Administra el stock de materiales y equipamiento</p>
        </div>
        <Button onClick={handleCreate} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por SKU, nombre o ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{es.common.loading}</div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Stock mín.</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No hay items disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const isLowStock = item.stock <= item.stockMin
                  return (
                    <TableRow key={item.sku}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{item.sku}</code>
                      </TableCell>
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell>{item.talla || "-"}</TableCell>
                      <TableCell>{item.color || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={isLowStock ? "text-destructive font-bold" : ""}>{item.stock}</span>
                          {isLowStock && <Badge variant="destructive">{es.inventario.lowStock}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{item.stockMin}</TableCell>
                      <TableCell>{item.ubicacion || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <ArrowUpDown className="w-4 h-4 mr-2" />
                              Acciones
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAdjust(item)}>
                              {es.inventario.adjustStock}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>{es.common.edit}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive">
                              {es.common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialogs */}
      <InventarioFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        item={editingItem}
        onSuccess={loadItems}
      />

      {adjustingItem && (
        <AdjustStockDialog
          open={adjustDialogOpen}
          onOpenChange={setAdjustDialogOpen}
          item={adjustingItem}
          onSuccess={loadItems}
        />
      )}
    </div>
  )
}

