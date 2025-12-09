"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiSimulada } from "@/lib/mock"
import type { Inventario } from "@/lib/types"
import { es } from "@/lib/i18n/es"

const inventarioSchema = z.object({
  sku: z.string().min(2, "El SKU debe tener al menos 2 caracteres"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  talla: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().min(0, "El stock no puede ser negativo"),
  stockMin: z.number().min(0, "El stock mínimo no puede ser negativo"),
  ubicacion: z.string().optional(),
})

type InventarioFormData = z.infer<typeof inventarioSchema>

interface InventarioFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: Inventario
  onSuccess: () => void
}

export function InventarioFormDialog({ open, onOpenChange, item, onSuccess }: InventarioFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioSchema),
    defaultValues: item || {
      stock: 0,
      stockMin: 10,
    },
  })

  const onSubmit = async (data: InventarioFormData) => {
    setLoading(true)
    try {
      if (item) {
        await apiSimulada.updateInventarioItem(item.sku, data)
        toast({ title: "Item actualizado", description: "El item se actualizó correctamente" })
      } else {
        await apiSimulada.createInventarioItem(data)
        toast({ title: "Item creado", description: "El item se creó correctamente" })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el item",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Editar item" : "Nuevo item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" {...register("sku")} placeholder="AGUA-500" disabled={!!item} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
              {item && <p className="text-xs text-muted-foreground">El SKU no se puede modificar</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register("nombre")} placeholder="Agua en botella 500cc" />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="talla">Talla</Label>
              <Input id="talla" {...register("talla")} placeholder="M, L, XL..." />
              {errors.talla && <p className="text-xs text-destructive">{errors.talla.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" {...register("color")} placeholder="Azul, Rojo..." />
              {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock actual *</Label>
              <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} placeholder="0" />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockMin">Stock mínimo *</Label>
              <Input id="stockMin" type="number" {...register("stockMin", { valueAsNumber: true })} placeholder="10" />
              {errors.stockMin && <p className="text-xs text-destructive">{errors.stockMin.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input id="ubicacion" {...register("ubicacion")} placeholder="Bodega 1, Estante A..." />
              {errors.ubicacion && <p className="text-xs text-destructive">{errors.ubicacion.message}</p>}
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

