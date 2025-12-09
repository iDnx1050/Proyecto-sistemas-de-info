"use client"

import { useEffect, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CursoFormDialog } from "@/components/cursos/curso-form-dialog"
import { CursosTable } from "@/components/cursos/cursos-table"
import { apiSimulada } from "@/lib/mock"
import type { Curso } from "@/lib/types"
import { es } from "@/lib/i18n/es"
import { useRouter } from "next/navigation"

export default function CursosPage() {
  const router = useRouter()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCurso, setEditingCurso] = useState<Curso | undefined>()

  const loadCursos = async () => {
    setLoading(true)
    const data = await apiSimulada.getCursos()
    setCursos(data)
    setFilteredCursos(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCursos()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = cursos.filter(
        (curso) =>
          curso.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          curso.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          curso.lugar.toLowerCase().includes(searchQuery.toLowerCase()) ||
          curso.responsable.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredCursos(filtered)
    } else {
      setFilteredCursos(cursos)
    }
  }, [searchQuery, cursos])

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCurso(undefined)
    setDialogOpen(true)
  }

  const handleSuccess = () => {
    loadCursos()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{es.cursos.title}</h1>
          <p className="text-muted-foreground mt-1">Administra los cursos y capacitaciones</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="secondary" size="lg" className="gap-2" onClick={() => router.push("/app/cursos/tipos")}>
            Tipo de curso
          </Button>
          <Button onClick={handleCreate} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            {es.cursos.create}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, tipo, lugar o responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{es.common.loading}</div>
      ) : (
        <CursosTable cursos={filteredCursos} onEdit={handleEdit} onRefresh={loadCursos} />
      )}

      {/* Dialog */}
      <CursoFormDialog open={dialogOpen} onOpenChange={setDialogOpen} curso={editingCurso} onSuccess={handleSuccess} />
    </div>
  )
}

