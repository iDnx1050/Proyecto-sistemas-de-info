"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Plus, CheckCircle, ListChecks, Sparkles, Trash2, Boxes, PencilLine } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { apiSimulada } from "@/lib/mock"
import type { Curso, Inventario, PlantillaChecklist } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ChecklistDraft = {
  item: string
  unidad: string
  cantidadPorPersona: number
  sku?: string
}

const STORAGE_KEY = "demo-course-types"

export default function TiposCursoPage() {
  const { toast } = useToast()
  const [tipos, setTipos] = useState<PlantillaChecklist[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [inventario, setInventario] = useState<Inventario[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre: "",
  })
  const [checklist, setChecklist] = useState<ChecklistDraft[]>([
    { item: "", unidad: "", cantidadPorPersona: 1, sku: "" },
  ])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [base, inv, cursosData] = await Promise.all([
        apiSimulada.getPlantillas(),
        apiSimulada.getInventario(),
        apiSimulada.getCursos(),
      ])
      const saved = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null
      const localTipos: PlantillaChecklist[] = saved ? JSON.parse(saved) : []
      setTipos([...base, ...localTipos])
      setInventario(inv)
      setCursos(cursosData)
      setLoading(false)
    }
    load()
  }, [])

  const canSave = useMemo(() => {
    const hasChecklist = checklist.some((c) => c.item.trim() && c.sku?.trim())
    return form.nombre.trim() && hasChecklist
  }, [form, checklist])

  const updateChecklistItem = (index: number, key: keyof ChecklistDraft, value: string) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: key === "cantidadPorPersona" ? Number(value) || 0 : value,
            }
          : item,
      ),
    )
  }

  const addChecklistItem = () =>
    setChecklist((prev) => [...prev, { item: "", unidad: "", cantidadPorPersona: 1, sku: "" }])

  const removeChecklistItem = (index: number) => setChecklist((prev) => prev.filter((_, i) => i !== index))

  const handleInventorySelect = (index: number, sku: string) => {
    const selected = inventario.find((i) => i.sku === sku)
    if (!selected) return
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              sku: selected.sku,
              item: selected.nombre,
              unidad: item.unidad || "unidad",
            }
          : item,
      ),
    )
  }

  const handleSave = () => {
    if (!canSave) return
    const newType: PlantillaChecklist = {
      id: editingId ?? `PL-LOCAL-${Date.now()}`,
      nombre: form.nombre.trim(),
      tipo: form.nombre.trim(),
      items: checklist
        .filter((c) => c.item.trim())
        .map((c) => ({
          item: c.item.trim(),
          unidad: c.unidad || "unidad",
          cantidadPorPersona: c.cantidadPorPersona || 1,
          sku: c.sku?.trim() || undefined,
        })),
    }

    setTipos((prev) => {
      const next = editingId ? prev.map((t) => (t.id === editingId ? newType : t)) : [...prev, newType]
      if (typeof window !== "undefined") {
        const base = next.filter((t) => t.id.startsWith("PL-LOCAL-"))
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
      }
      return next
    })

    setForm({ nombre: "" })
    setChecklist([{ item: "", unidad: "", cantidadPorPersona: 1, sku: "" }])
    setEditingId(null)

    toast({
      title: editingId ? "Tipo de curso actualizado" : "Tipo de curso creado",
      description: editingId
        ? "Se guardaron los cambios del tipo y su checklist."
        : "Se registró el tipo y su checklist base.",
    })
  }

  const handleEdit = (tipo: PlantillaChecklist) => {
    if (!tipo.id.startsWith("PL-LOCAL-")) {
      toast({
        title: "Solo edición demo",
        description: "Los tipos precargados no se pueden editar en esta demo.",
        variant: "destructive",
      })
      return
    }
    setEditingId(tipo.id)
    setForm({ nombre: tipo.nombre })
    setChecklist(
      tipo.items.map((item) => ({
        item: item.item,
        unidad: item.unidad,
        cantidadPorPersona: item.cantidadPorPersona,
        sku: item.sku || "",
      })),
    )
  }

  const handleDelete = (tipo: PlantillaChecklist) => {
    const enUso = cursos.some((c) => c.plantillaChecklistId === tipo.id)
    if (enUso) {
      toast({
        title: "No se puede eliminar",
        description: "Este tipo está asignado a un curso y no puede borrarse.",
        variant: "destructive",
      })
      return
    }
    setTipos((prev) => {
      const next = prev.filter((t) => t.id !== tipo.id)
      if (typeof window !== "undefined") {
        const base = next.filter((t) => t.id.startsWith("PL-LOCAL-"))
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(base))
      }
      return next
    })
    if (editingId === tipo.id) {
      setEditingId(null)
      setForm({ nombre: "" })
      setChecklist([{ item: "", unidad: "", cantidadPorPersona: 1, sku: "" }])
    }
    toast({ title: "Tipo eliminado", description: "Se eliminó el tipo de curso." })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de curso</h1>
          <p className="text-muted-foreground">Define nuevas plantillas de cursos con su checklist asociado.</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-4 h-4" />
          Demo sin backend
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar tipo" : "Nuevo tipo"}</CardTitle>
            <CardDescription>Nombre y checklist base.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del tipo</Label>
              <Input
                id="nombre"
                placeholder="Curso de logística avanzada"
                value={form.nombre}
                onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                Checklist base
              </h3>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addChecklistItem}>
                <Plus className="w-4 h-4" />
                Añadir ítem
              </Button>
            </div>

            <div className="space-y-3">
              {checklist.map((item, index) => (
                <div key={index} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1.5fr,1fr,1fr,auto] items-start">
                  <div className="space-y-2">
                    <Label>Ítem (desde inventario)</Label>
                    <Select
                      value={item.sku || ""}
                      onValueChange={(value) => handleInventorySelect(index, value)}
                      disabled={inventario.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={inventario.length ? "Selecciona un insumo" : "Sin inventario cargado"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                            <Boxes className="w-4 h-4" />
                            Inventario
                          </SelectLabel>
                          {inventario.map((inv) => (
                            <SelectItem key={inv.sku} value={inv.sku}>
                              {inv.nombre} — {inv.sku} (Stock: {inv.stock})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unidad</Label>
                    <Input
                      value={item.unidad}
                      onChange={(e) => updateChecklistItem(index, "unidad", e.target.value)}
                      placeholder="unidad / caja"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad por persona</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      value={item.cantidadPorPersona}
                      onChange={(e) => updateChecklistItem(index, "cantidadPorPersona", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SKU</Label>
                    <div className="flex gap-2">
                      <Input value={item.sku} readOnly placeholder="Selecciona un ítem" />
                      {checklist.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeChecklistItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" className="w-full gap-2" onClick={handleSave} disabled={!canSave}>
              <CheckCircle className="w-4 h-4" />
              {editingId ? "Actualizar tipo de curso" : "Guardar tipo de curso"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setEditingId(null)
                  setForm({ nombre: "" })
                  setChecklist([{ item: "", unidad: "", cantidadPorPersona: 1, sku: "" }])
                }}
              >
                Cancelar edición
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos registrados</CardTitle>
            <CardDescription>Incluye los tipos precargados y los que agregues en esta sesión.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando tipos...</p>
            ) : tipos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay tipos definidos.</p>
            ) : (
              <div className="space-y-4">
                {tipos.map((tipo) => {
                  const esLocal = tipo.id.startsWith("PL-LOCAL-")
                  const enUso = cursos.some((c) => c.plantillaChecklistId === tipo.id)
                  return (
                    <div key={tipo.id} className="rounded-lg border p-4 space-y-2 bg-card/50">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-semibold">{tipo.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{tipo.tipo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {tipo.tipo}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tipo)}
                            title="Editar tipo"
                            disabled={!esLocal}
                          >
                            <PencilLine className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tipo)}
                            title={enUso ? "Tipo en uso" : "Eliminar tipo"}
                            className="text-destructive"
                            disabled={!esLocal && !enUso ? false : enUso || !esLocal}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Checklist:</p>
                        <div className="space-y-1">
                          {tipo.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="font-medium text-foreground">{item.item}</span>
                              <span className="text-xs">• {item.unidad}</span>
                              <span className="text-xs">• x{item.cantidadPorPersona}</span>
                              {item.sku && <Badge variant="outline">SKU: {item.sku}</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
