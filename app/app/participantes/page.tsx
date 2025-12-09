"use client"

import { useEffect, useState } from "react"
import { Search, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { apiSimulada } from "@/lib/mock"
import type { Participante, Curso } from "@/lib/types"
import { es } from "@/lib/i18n/es"

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [filteredParticipantes, setFilteredParticipantes] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [cursoFilter, setCursoFilter] = useState<string>("todos")
  const [alergiaFilter, setAlergiaFilter] = useState<string>("todos")

  const loadData = async () => {
    setLoading(true)
    const [participantesData, cursosData] = await Promise.all([apiSimulada.getParticipantes(), apiSimulada.getCursos()])
    setParticipantes(participantesData)
    setCursos(cursosData)
    setFilteredParticipantes(participantesData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = participantes

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((p) => p.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by curso
    if (cursoFilter !== "todos") {
      filtered = filtered.filter((p) => p.cursoId === cursoFilter)
    }

    // Filter by alergias
    if (alergiaFilter === "con-alergias") {
      filtered = filtered.filter((p) => p.alergias)
    } else if (alergiaFilter === "sin-alergias") {
      filtered = filtered.filter((p) => !p.alergias)
    }

    setFilteredParticipantes(filtered)
  }, [searchQuery, cursoFilter, alergiaFilter, participantes])

  const getCursoNombre = (cursoId: string) => {
    const curso = cursos.find((c) => c.id === cursoId)
    return curso?.nombre || cursoId
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{es.participantes.title}</h1>
        <p className="text-muted-foreground mt-1">Vista general de todos los participantes</p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Buscar participante</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Filtrar por curso</Label>
          <Select value={cursoFilter} onValueChange={setCursoFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los cursos</SelectItem>
              {cursos.map((curso) => (
                <SelectItem key={curso.id} value={curso.id}>
                  {curso.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Filtrar por alergias</Label>
          <Select value={alergiaFilter} onValueChange={setAlergiaFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="con-alergias">Con alergias</SelectItem>
              <SelectItem value="sin-alergias">Sin alergias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Total participantes</p>
          <p className="text-2xl font-bold mt-1">{participantes.length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Con alergias</p>
          <p className="text-2xl font-bold mt-1">{participantes.filter((p) => p.alergias).length}</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <p className="text-sm text-muted-foreground">Cursos activos</p>
          <p className="text-2xl font-bold mt-1">{cursos.length}</p>
        </div>
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
                <TableHead>Curso</TableHead>
                <TableHead>Alergias</TableHead>
                <TableHead>Talla polera</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay participantes disponibles
                  </TableCell>
                </TableRow>
              ) : (
                filteredParticipantes.map((participante) => (
                  <TableRow key={participante.id}>
                    <TableCell className="font-medium">{participante.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{getCursoNombre(participante.cursoId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {participante.alergias ? (
                        <Badge variant="destructive">{participante.alergias}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin alergias</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {participante.tallaPolera ? (
                        <Badge variant="outline">{participante.tallaPolera}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

