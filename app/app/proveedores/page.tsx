"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Mail, Phone, MoreHorizontal, Pencil, Trash2, MapPin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { ProveedorFormDialog } from "@/components/proveedores/proveedor-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { apiSimulada } from "@/lib/mock"
import type { Proveedor } from "@/lib/types"
import { es } from "@/lib/i18n/es"

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | undefined>()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  const loadProveedores = async () => {
    setLoading(true)
    const data = await apiSimulada.getProveedores()
    setProveedores(data)
    setFilteredProveedores(data)
    setLoading(false)
  }

  useEffect(() => {
    loadProveedores()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = proveedores.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.contacto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.telefono?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.telefono2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.direccion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.web?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProveedores(filtered)
    } else {
      setFilteredProveedores(proveedores)
    }
  }, [searchQuery, proveedores])

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingProveedor(undefined)
    setDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    try {
      await apiSimulada.deleteProveedor(deleteId)
      toast({ title: "Proveedor eliminado", description: "El proveedor se eliminó correctamente" })
      loadProveedores()
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el proveedor",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{es.proveedores.title}</h1>
          <p className="text-muted-foreground mt-1">Administra los proveedores de materiales y servicios</p>
        </div>
        <Button onClick={handleCreate} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo proveedor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, teléfono o dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{es.common.loading}</div>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Web</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProveedores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay proveedores disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredProveedores.map((proveedor) => (
                  <TableRow key={proveedor.id}>
                    <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                    <TableCell>
                      {proveedor.contacto ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <a href={`mailto:${proveedor.contacto}`} className="text-sm hover:underline">
                            {proveedor.contacto}
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {proveedor.telefono || proveedor.telefono2 ? (
                        <div className="flex flex-col gap-1">
                          {proveedor.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <a href={`tel:${proveedor.telefono}`} className="text-sm hover:underline">
                                {proveedor.telefono}
                              </a>
                            </div>
                          )}
                          {proveedor.telefono2 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${proveedor.telefono2}`} className="text-sm hover:underline">
                                {proveedor.telefono2}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {proveedor.direccion ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{proveedor.direccion}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {proveedor.web ? (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <a href={proveedor.web} target="_blank" rel="noreferrer" className="text-sm hover:underline">
                            {proveedor.web}
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(proveedor)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {es.common.edit}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(proveedor.id)}
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
      )}

      {/* Dialogs */}
      <ProveedorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        proveedor={editingProveedor}
        onSuccess={loadProveedores}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proveedor será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
