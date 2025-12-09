"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, Users, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiSimulada } from "@/lib/mock"
import type { Curso, ChecklistItem, Participante, Factura } from "@/lib/types"
import { format } from "date-fns"
import { es as dateFnsEs } from "date-fns/locale"
import { ChecklistTab } from "@/components/cursos/checklist-tab"
import { ParticipantesTab } from "@/components/cursos/participantes-tab"
import { FacturasTab } from "@/components/cursos/facturas-tab"
import { useToast } from "@/hooks/use-toast"
import { es } from "@/lib/i18n/es"

export default function CursoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const cursoId = params.id as string

  const [curso, setCurso] = useState<Curso | null>(null)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingChecklist, setGeneratingChecklist] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    const [cursoData, checklistData, participantesData, facturasData] = await Promise.all([
      apiSimulada.getCurso(cursoId),
      apiSimulada.getChecklistItems(cursoId),
      apiSimulada.getParticipantes(cursoId),
      apiSimulada.getFacturas(cursoId),
    ])

    setCurso(cursoData)
    setChecklistItems(checklistData)
    setParticipantes(participantesData)
    setFacturas(facturasData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [cursoId])

  useEffect(() => {
    const autoGenerate = async () => {
      if (!curso || loading || generatingChecklist) return
      if (checklistItems.length > 0) return
      if (!curso.plantillaChecklistId) return
      setGeneratingChecklist(true)
      try {
        await apiSimulada.generateChecklistFromTemplate(cursoId, curso.plantillaChecklistId, curso.asistentes)
        await loadData()
        toast({
          title: "Checklist generado",
          description: "Se generó automáticamente el checklist desde la plantilla seleccionada.",
        })
      } catch (error) {
        toast({
          title: "No se pudo generar el checklist",
          description: "Intenta generar manualmente desde la pestaña Checklist.",
          variant: "destructive",
        })
      } finally {
        setGeneratingChecklist(false)
      }
    }
    autoGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso, checklistItems.length, loading, cursoId])

  const handleToggleActivo = async () => {
    if (!curso) return

    setStatusLoading(true)
    try {
      const updated = await apiSimulada.updateCurso(curso.id, { activo: !curso.activo })
      if (updated) {
        setCurso(updated)
        toast({
          title: updated.activo ? es.cursos.status.activated : es.cursos.status.deactivated,
          description: es.cursos.status.updated,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del curso",
        variant: "destructive",
      })
    } finally {
      setStatusLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">{es.common.loading}</div>
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">Curso no encontrado</div>
      </div>
    )
  }

  const itemsListos = checklistItems.filter((item) => item.estado === "listo").length
  const itemsTotal = checklistItems.length
  const participantesConAlergias = participantes.filter((p) => p.alergias).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{curso.nombre}</h1>
          <p className="text-muted-foreground mt-1">ID: {curso.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={curso.activo ? "secondary" : "outline"}
            onClick={handleToggleActivo}
            disabled={statusLoading}
            className={
              curso.activo
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                : "border-dashed text-muted-foreground"
            }
          >
            {statusLoading ? es.common.loading : curso.activo ? es.cursos.status.activo : es.cursos.status.inactivo}
          </Button>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {curso.tipo}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resumen">{es.cursos.tabs.resumen}</TabsTrigger>
          <TabsTrigger value="checklist">{es.cursos.tabs.checklist}</TabsTrigger>
          <TabsTrigger value="participantes">{es.cursos.tabs.participantes}</TabsTrigger>
          <TabsTrigger value="facturas">{es.cursos.tabs.facturas}</TabsTrigger>
        </TabsList>

        {/* Resumen Tab */}
        <TabsContent value="resumen" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {format(new Date(curso.fechaISO), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                        locale: dateFnsEs,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lugar</p>
                    <p className="font-medium">{curso.lugar}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Asistentes</p>
                    <p className="font-medium">{curso.asistentes} personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Responsable</p>
                    <p className="font-medium">{curso.responsable}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado del checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progreso</span>
                    <span className="text-sm font-medium">
                      {itemsListos} / {itemsTotal} items
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${itemsTotal > 0 ? (itemsListos / itemsTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {participantesConAlergias > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      ⚠️ {participantesConAlergias} participante{participantesConAlergias > 1 ? "s" : ""} con alergias
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Revisar la pestaña de participantes para más detalles
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-2xl font-bold">{participantes.length}</p>
                    <p className="text-xs text-muted-foreground">Participantes</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{facturas.length}</p>
                    <p className="text-xs text-muted-foreground">Facturas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist">
          <ChecklistTab cursoId={cursoId} curso={curso} onRefresh={loadData} />
        </TabsContent>

        {/* Participantes Tab */}
        <TabsContent value="participantes">
          <ParticipantesTab cursoId={cursoId} onRefresh={loadData} />
        </TabsContent>

        {/* Facturas Tab */}
        <TabsContent value="facturas">
          <FacturasTab cursoId={cursoId} onRefresh={loadData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
