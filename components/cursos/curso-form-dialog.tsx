"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { apiSimulada } from "@/lib/mock"
import type { Curso, PlantillaChecklist } from "@/lib/types"
import { es } from "@/lib/i18n/es"

const cursoSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  tipo: z.string().min(2, "Selecciona un tipo de curso"),
  fechaISO: z.string().min(1, "La fecha es requerida"),
  lugar: z.string().min(3, "El lugar debe tener al menos 3 caracteres"),
  asistentes: z.number().min(1, "Debe haber al menos 1 asistente"),
  responsable: z.string().min(3, "El responsable es requerido"),
  plantillaChecklistId: z.string().min(1, "Seleccione una plantilla"),
  activo: z.boolean().default(true),
})

type CursoFormData = z.infer<typeof cursoSchema>

interface CursoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  curso?: Curso
  onSuccess: () => void
}

export function CursoFormDialog({ open, onOpenChange, curso, onSuccess }: CursoFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [plantillas, setPlantillas] = useState<PlantillaChecklist[]>([])
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CursoFormData>({
    resolver: zodResolver(cursoSchema),
    defaultValues: curso
      ? {
          nombre: curso.nombre,
          tipo: curso.tipo,
          fechaISO: curso.fechaISO.split("T")[0],
          lugar: curso.lugar,
          asistentes: curso.asistentes,
          responsable: curso.responsable,
          plantillaChecklistId: curso.plantillaChecklistId,
          activo: curso.activo,
        }
      : {
          tipo: "Primeros Auxilios",
          plantillaChecklistId: "PL-FA",
          asistentes: 20,
          activo: true,
        },
  })

  useEffect(() => {
    async function loadPlantillas() {
      const base = await apiSimulada.getPlantillas()
      const saved = typeof window !== "undefined" ? window.localStorage.getItem("demo-course-types") : null
      const locales: PlantillaChecklist[] = saved ? JSON.parse(saved) : []
      const merged = [...base, ...locales]
      setPlantillas(merged)

      if (!curso && merged.length) {
        setValue("plantillaChecklistId", merged[0].id, { shouldValidate: true })
        setValue("tipo", merged[0].tipo, { shouldValidate: true })
      }
    }
    loadPlantillas()
  }, [curso, setValue])

  const tipo = watch("tipo")
  const activo = watch("activo")
  const plantillaId = watch("plantillaChecklistId")

  const tiposDisponibles = useMemo(() => {
    const set = new Set<string>()
    plantillas.forEach((p) => set.add(p.tipo))
    return Array.from(set)
  }, [plantillas])

  useEffect(() => {
    if (!plantillas.length) return
    // Seleccionar automáticamente una plantilla según el tipo elegido, o la primera disponible.
    const matchByType = plantillas.find((p) => p.tipo === tipo) || plantillas.find((p) => p.nombre === tipo)
    const fallback = plantillas[0]
    const target = matchByType || fallback
    if (target && target.id !== plantillaId) {
      setValue("plantillaChecklistId", target.id, { shouldValidate: true })
    }
  }, [plantillas, tipo, setValue, plantillaId])

  const onSubmit = async (data: CursoFormData) => {
    setLoading(true)
    try {
      const fechaISO = new Date(data.fechaISO).toISOString()

      if (curso) {
        await apiSimulada.updateCurso(curso.id, { ...data, fechaISO })
        toast({ title: "Curso actualizado", description: "El curso se actualizó correctamente" })
      } else {
        await apiSimulada.createCurso({ ...data, fechaISO })
        toast({ title: "Curso creado", description: "El curso se creó correctamente" })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el curso",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{curso ? es.cursos.edit : es.cursos.create}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del curso *</Label>
              <Input id="nombre" {...register("nombre")} placeholder="Ej: Primeros Auxilios Básicos" />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de curso *</Label>
              <Select
                value={tipo}
                onValueChange={(value) => setValue("tipo", value as CursoFormData["tipo"], { shouldValidate: true })}
                disabled={!tiposDisponibles.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposDisponibles.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaISO">Fecha del curso *</Label>
              <Input id="fechaISO" type="date" {...register("fechaISO")} />
              {errors.fechaISO && <p className="text-xs text-destructive">{errors.fechaISO.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asistentes">Número de asistentes *</Label>
              <Input
                id="asistentes"
                type="number"
                {...register("asistentes", { valueAsNumber: true })}
                placeholder="20"
              />
              {errors.asistentes && <p className="text-xs text-destructive">{errors.asistentes.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lugar">Lugar *</Label>
              <Input id="lugar" {...register("lugar")} placeholder="Ej: Colegio San Martín" />
              {errors.lugar && <p className="text-xs text-destructive">{errors.lugar.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable *</Label>
              <Input id="responsable" {...register("responsable")} placeholder="Ej: María González" />
              {errors.responsable && <p className="text-xs text-destructive">{errors.responsable.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Estado</p>
              <p className="text-xs text-muted-foreground">Controla si el curso está visible y operativo.</p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="activo"
                checked={activo}
                onCheckedChange={(checked) => setValue("activo", checked, { shouldValidate: true })}
                disabled={loading}
              />
              <Label htmlFor="activo" className="text-sm font-medium">
                {activo ? es.cursos.status.activo : es.cursos.status.inactivo}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {es.common.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? es.common.loading : es.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
