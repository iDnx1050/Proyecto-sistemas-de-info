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
import type { Proveedor } from "@/lib/types"
import { es } from "@/lib/i18n/es"

const proveedorSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  contacto: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z
    .string()
    .regex(/^\+?\d[\d\s+-]{7,}$/, "Ingresa un teléfono válido")
    .optional()
    .or(z.literal("")),
  telefono2: z
    .string()
    .regex(/^\+?\d[\d\s+-]{7,}$/, "Ingresa un teléfono válido")
    .optional()
    .or(z.literal("")),
  direccion: z.string().max(120, "La dirección es demasiado larga").optional().or(z.literal("")),
  web: z.string().url("URL inválida").optional().or(z.literal("")),
})
type ProveedorFormData = z.infer<typeof proveedorSchema>

interface ProveedorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor?: Proveedor
  onSuccess: () => void
}

export function ProveedorFormDialog({ open, onOpenChange, proveedor, onSuccess }: ProveedorFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: proveedor || {},
  })

  const onSubmit = async (data: ProveedorFormData) => {
    setLoading(true)
    try {
      if (proveedor) {
        await apiSimulada.updateProveedor(proveedor.id, data)
        toast({ title: "Proveedor actualizado", description: "El proveedor se actualizó correctamente" })
      } else {
        await apiSimulada.createProveedor(data)
        toast({ title: "Proveedor creado", description: "El proveedor se creó correctamente" })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el proveedor",
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
          <DialogTitle>{proveedor ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" {...register("nombre")} placeholder="Distribuidora Médica Chile" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contacto">Email de contacto</Label>
            <Input id="contacto" type="email" {...register("contacto")} placeholder="ventas@proveedor.cl" />
            {errors.contacto && <p className="text-xs text-destructive">{errors.contacto.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="web">Página web</Label>
            <Input id="web" type="url" {...register("web")} placeholder="https://www.proveedor.cl" />
            {errors.web && <p className="text-xs text-destructive">{errors.web.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" {...register("direccion")} placeholder="Av. Principal 1234, Santiago" />
            {errors.direccion && <p className="text-xs text-destructive">{errors.direccion.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" {...register("telefono")} placeholder="+56 9 xxxx xxxx" />
            {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono2">Teléfono secundario</Label>
            <Input id="telefono2" {...register("telefono2")} placeholder="+56 2 xxxx xxxx" />
            {errors.telefono2 && <p className="text-xs text-destructive">{errors.telefono2.message}</p>}
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
