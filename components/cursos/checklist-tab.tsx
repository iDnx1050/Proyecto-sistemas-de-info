"use client"

import { useEffect, useState } from "react"
import { Package, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiSimulada } from "@/lib/mock"
import type { Curso, ChecklistItem } from "@/lib/types"
import { es } from "@/lib/i18n/es"

interface ChecklistTabProps {
  cursoId: string
  curso: Curso
  onRefresh: () => void
}

type EditableItem = ChecklistItem & { isNew?: boolean }

export function ChecklistTab({ cursoId, curso, onRefresh }: ChecklistTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItems, setEditingItems] = useState<EditableItem[]>([])
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const loadItems = async () => {
    setLoading(true)
    const data = await apiSimulada.getChecklistItems(cursoId)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
    const handler = (evt: Event) => {
      const detalle = (evt as CustomEvent).detail
      if (detalle === "checklistItems") {
        loadItems()
      }
    }
    window.addEventListener("demo-data-update", handler as EventListener)
    return () => window.removeEventListener("demo-data-update", handler as EventListener)
  }, [cursoId])

  const handleUpdateEstado = async (itemId: string, nuevoEstado: ChecklistItem["estado"]) => {
    try {
      await apiSimulada.updateChecklistItem(itemId, { estado: nuevoEstado })

      if (nuevoEstado === "entregado") {
        const item = items.find((i) => i.id === itemId)
        if (item?.sku) {
          await apiSimulada.adjustStock(item.sku, item.qtyPlanificada, "salida", `Curso ${cursoId}`, "system@ong.cl")
        }
      }

      toast({ title: "Estado actualizado", description: "El estado del item se actualizó correctamente" })
      loadItems()
      onRefresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al actualizar el estado",
        variant: "destructive",
      })
    }
  }

  const getEstadoBadge = (estado: ChecklistItem["estado"]) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="outline">Pendiente</Badge>
      case "listo":
        return <Badge variant="secondary">Listo</Badge>
      case "entregado":
        return <Badge>Entregado</Badge>
    }
  }

  const openEditDialog = () => {
    setEditingItems(items)
    setRemovedIds([])
    setEditDialogOpen(true)
  }

  const updateEditingItem = (id: string, field: keyof EditableItem, value: any) => {
    setEditingItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: field === "qtyPlanificada" ? Number(value) || 0 : value }
          : item,
      ),
    )
  }

  const addNewItem = () => {
    const newItem: EditableItem = {
      id: `NEW-${Date.now()}`,
      isNew: true,
      cursoId,
      item: "Nuevo item",
      unidad: "unidad",
      qtyPlanificada: 1,
      origen: "compra",
      estado: "pendiente",
      notas: "",
    }
    setEditingItems((prev) => [...prev, newItem])
  }

  const removeEditingItem = (id: string) => {
    setEditingItems((prev) => prev.filter((item) => item.id !== id))
    if (!id.startsWith("NEW-")) {
      setRemovedIds((prev) => [...prev, id])
    }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      for (const id of removedIds) {
        await apiSimulada.deleteChecklistItem(id)
      }

      for (const item of editingItems) {
        if (item.isNew || item.id.startsWith("NEW-")) {
          await apiSimulada.createChecklistItem({
            cursoId,
            item: item.item,
            unidad: item.unidad,
            qtyPlanificada: item.qtyPlanificada,
            cantidadPorPersona: item.cantidadPorPersona,
            sku: item.sku,
            origen: item.origen || "compra",
            estado: item.estado || "pendiente",
            notas: item.notas,
          })
        } else {
          await apiSimulada.updateChecklistItem(item.id, {
            item: item.item,
            unidad: item.unidad,
            qtyPlanificada: item.qtyPlanificada,
            notas: item.notas,
            sku: item.sku,
          })
        }
      }

      toast({ title: "Checklist actualizado", description: "Los cambios se guardaron correctamente." })
      setEditDialogOpen(false)
      loadItems()
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron guardar los cambios del checklist", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">{es.common.loading}</div>
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay checklist generado</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
            Genera el checklist desde la plantilla para comenzar a planificar los materiales del curso
          </p>
          <Button onClick={openEditDialog}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar checklist
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items del checklist</CardTitle>
          <Button variant="outline" size="sm" onClick={openEditDialog}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar checklist
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>
                      {item.sku ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">{item.sku}</code>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>{item.qtyPlanificada}</TableCell>
                    <TableCell>{item.unidad}</TableCell>
                    <TableCell>
                      <Badge variant={item.origen === "bodega" ? "default" : "secondary"}>
                        {item.origen === "bodega" ? "Bodega" : "Compra"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {item.notas || "-"}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {item.estado !== "entregado" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleUpdateEstado(item.id, item.estado === "pendiente" ? "listo" : "entregado")
                          }
                        >
                          {item.estado === "pendiente" ? "Marcar listo" : "Marcar entregado"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Modifica cantidades, unidades o notas. También puedes eliminar items.</p>
              <Button size="sm" variant="outline" onClick={addNewItem} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar item
              </Button>
            </div>
            <div className="rounded-lg border max-h-[420px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="w-24">Cantidad</TableHead>
                    <TableHead className="w-32">Unidad</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editingItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.item}
                          onChange={(e) => updateEditingItem(item.id, "item", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.sku || ""}
                          onChange={(e) => updateEditingItem(item.id, "sku", e.target.value)}
                          placeholder="SKU opcional"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.qtyPlanificada}
                          onChange={(e) => updateEditingItem(item.id, "qtyPlanificada", e.target.value)}
                          min={0}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.unidad}
                          onChange={(e) => updateEditingItem(item.id, "unidad", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={item.notas || ""}
                          onChange={(e) => updateEditingItem(item.id, "notas", e.target.value)}
                          rows={1}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeEditingItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
