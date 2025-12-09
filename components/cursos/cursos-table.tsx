"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es as dateFnsEs } from "date-fns/locale"
import { MoreHorizontal, Eye, Pencil, Copy, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { useToast } from "@/hooks/use-toast"
import { apiSimulada } from "@/lib/mock"
import type { Curso } from "@/lib/types"
import { useRouter } from "next/navigation"
import { es } from "@/lib/i18n/es"

interface CursosTableProps {
  cursos: Curso[]
  onEdit: (curso: Curso) => void
  onRefresh: () => void
}

export function CursosTable({ cursos, onEdit, onRefresh }: CursosTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    if (!deleteId) return

    setLoading(true)
    try {
      await apiSimulada.deleteCurso(deleteId)
      toast({ title: "Curso eliminado", description: "El curso se eliminó correctamente" })
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el curso",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setDeleteId(null)
    }
  }

  const handleDuplicate = async (curso: Curso) => {
    try {
      await apiSimulada.createCurso({
        nombre: `${curso.nombre} (Copia)`,
        tipo: curso.tipo,
        fechaISO: curso.fechaISO,
        lugar: curso.lugar,
        asistentes: curso.asistentes,
        responsable: curso.responsable,
        activo: curso.activo,
        plantillaChecklistId: curso.plantillaChecklistId,
      })
      toast({ title: "Curso duplicado", description: "El curso se duplicó correctamente" })
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al duplicar el curso",
        variant: "destructive",
      })
    }
  }

  const handleToggleActivo = async (curso: Curso) => {
    setTogglingId(curso.id)
    try {
      await apiSimulada.updateCurso(curso.id, { activo: !curso.activo })
      toast({
        title: curso.activo ? es.cursos.status.deactivated : es.cursos.status.activated,
        description: es.cursos.status.updated,
      })
      onRefresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del curso",
        variant: "destructive",
      })
    } finally {
      setTogglingId(null)
    }
  }

  const getTipoBadgeVariant = (tipo: Curso["tipo"]) => {
    switch (tipo) {
      case "Primeros Auxilios":
        return "default"
      case "Prevención de Riesgos":
        return "secondary"
      case "Evacuación":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>Asistentes</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cursos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No hay cursos disponibles
                </TableCell>
              </TableRow>
            ) : (
              cursos.map((curso) => (
                <TableRow key={curso.id}>
                  <TableCell className="font-medium">{curso.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={getTipoBadgeVariant(curso.tipo)}>{curso.tipo}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(curso.fechaISO), "dd MMM yyyy", { locale: dateFnsEs })}</TableCell>
                  <TableCell>{curso.lugar}</TableCell>
                  <TableCell>{curso.asistentes}</TableCell>
                  <TableCell>{curso.responsable}</TableCell>
                  <TableCell>
                    <Button
                      variant={curso.activo ? "secondary" : "outline"}
                      size="sm"
                      className={
                        curso.activo
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                          : "border-dashed text-muted-foreground"
                      }
                      onClick={() => handleToggleActivo(curso)}
                      disabled={togglingId === curso.id}
                    >
                      {togglingId === curso.id
                        ? es.common.loading
                        : curso.activo
                          ? es.cursos.status.activo
                          : es.cursos.status.inactivo}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/app/cursos/${curso.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          {es.common.view}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(curso)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          {es.common.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(curso)}>
                          <Copy className="w-4 h-4 mr-2" />
                          {es.common.duplicate}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(curso.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {es.common.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los datos relacionados (checklist,
              participantes, facturas).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

