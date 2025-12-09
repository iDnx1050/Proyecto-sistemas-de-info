"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiSimulada } from "@/lib/mock"
import type { Participante } from "@/lib/types"
import { es } from "@/lib/i18n/es"
import { useToast } from "@/hooks/use-toast"

const participanteSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido"),
  alergias: z.string().optional(),
  tallaPolera: z.enum(["XS", "S", "M", "L", "XL"]).optional(),
  isVegan: z.boolean().default(false),
})

type ParticipanteFormData = z.infer<typeof participanteSchema>

interface ParticipantesTabProps {
  cursoId: string
  onRefresh: () => void
}

export function ParticipantesTab({ cursoId, onRefresh }: ParticipantesTabProps) {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<ParticipanteFormData>({
    resolver: zodResolver(participanteSchema),
    defaultValues: {
      nombre: "",
      alergias: "",
      tallaPolera: undefined,
      isVegan: false,
    },
  })

  const loadParticipantes = async () => {
    setLoading(true)
    const data = await apiSimulada.getParticipantes(cursoId)
    setParticipantes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadParticipantes()
  }, [cursoId])

  const onSubmit = async (data: ParticipanteFormData) => {
    setSaving(true)
    try {
      await apiSimulada.createParticipante({
        cursoId,
        nombre: data.nombre,
        alergias: data.alergias || undefined,
        tallaPolera: data.tallaPolera,
        isVegan: data.isVegan,
      })
      toast({ title: "Participante agregado" })
      setDialogOpen(false)
      reset()
      loadParticipantes()
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo agregar el participante", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await apiSimulada.deleteParticipante(deleteId)
      toast({ title: "Participante eliminado" })
      setDeleteId(null)
      loadParticipantes()
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el participante", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const tallaPolera = watch("tallaPolera")

  const content =
    participantes.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay participantes registrados</h3>
          <p className="text-sm text-muted-foreground mb-4">Agrega participantes para gestionar alergias y tallas</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar participante
          </Button>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Participantes del curso</CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Alergias</TableHead>
                  <TableHead>Vegano</TableHead>
                  <TableHead>Talla polera</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participantes.map((participante) => (
                  <TableRow key={participante.id}>
                    <TableCell className="font-medium">{participante.nombre}</TableCell>
                    <TableCell>
                      {participante.alergias ? (
                        <Badge variant="destructive">{participante.alergias}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin alergias</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {participante.isVegan ? (
                        <Badge variant="secondary">Sí</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {participante.tallaPolera ? (
                        <Badge variant="outline">{participante.tallaPolera}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(participante.id)}>
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">{es.common.loading}</div>
  }

  return (
    <>
      {content}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar participante</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...register("nombre")} placeholder="Ej: Ana Torres" />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Input id="alergias" {...register("alergias")} placeholder="Ej: gluten, maní" />
              {errors.alergias && <p className="text-xs text-destructive">{errors.alergias.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tallaPolera">Talla polera</Label>
              <Select
                value={tallaPolera ?? undefined}
                onValueChange={(value) => setValue("tallaPolera", value as ParticipanteFormData["tallaPolera"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona talla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="isVegan">Vegano</Label>
                <p className="text-xs text-muted-foreground">Indica si requiere alimentación vegana</p>
              </div>
              <Switch
                id="isVegan"
                checked={watch("isVegan")}
                onCheckedChange={(checked) => setValue("isVegan", checked)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                {es.common.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? es.common.loading : es.common.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar participante</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará al participante del curso.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-white">
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
