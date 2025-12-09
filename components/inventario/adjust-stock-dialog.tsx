"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiSimulada } from "@/lib/mock"
import type { Inventario } from "@/lib/types"
import { es } from "@/lib/i18n/es"

const adjustSchema = z.object({
  tipo: z.enum(["entrada", "salida"]),
  cantidad: z.number().min(1, "La cantidad debe ser mayor a 0"),
  referencia: z.string().optional(),
})

type AdjustFormData = z.infer<typeof adjustSchema>

interface AdjustStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: Inventario
  onSuccess: () => void
}

export function AdjustStockDialog({ open, onOpenChange, item, onSuccess }: AdjustStockDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AdjustFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      tipo: "entrada",
      cantidad: 1,
    },
  })

  const tipo = watch("tipo")

  const onSubmit = async (data: AdjustFormData) => {
    setLoading(true)
    try {
      await apiSimulada.adjustStock(item.sku, data.cantidad, data.tipo, data.referencia, "admin@ong.cl")
      toast({
        title: "Stock ajustado",
        description: `Se registró ${data.tipo === "entrada" ? "una entrada" : "una salida"} de ${data.cantidad} unidades`,
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al ajustar el stock",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm font-medium">{item.nombre}</p>
            <p className="text-xs text-muted-foreground mt-1">SKU: {item.sku}</p>
            <p className="text-lg font-bold mt-2">Stock actual: {item.stock}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de movimiento *</Label>
              <Select value={tipo} onValueChange={(value) => setValue("tipo", value as "entrada" | "salida")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (agregar stock)</SelectItem>
                  <SelectItem value="salida">Salida (restar stock)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input id="cantidad" type="number" {...register("cantidad", { valueAsNumber: true })} placeholder="1" />
              {errors.cantidad && <p className="text-xs text-destructive">{errors.cantidad.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input id="referencia" {...register("referencia")} placeholder="OC-123, Curso C-0001..." />
              <p className="text-xs text-muted-foreground">Opcional: orden de compra, curso, etc.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                {es.common.cancel}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? es.common.loading : "Ajustar stock"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

