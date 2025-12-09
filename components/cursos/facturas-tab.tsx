"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiSimulada } from "@/lib/mock"
import type { Factura } from "@/lib/types"
import { format } from "date-fns"
import { es as dateFnsEs } from "date-fns/locale"
import { es } from "@/lib/i18n/es"
import { useToast } from "@/hooks/use-toast"

const facturaSchema = z.object({
  fileName: z.string().min(1, "Archivo requerido"),
  fileType: z.enum(["pdf", "jpg"]),
  proveedor: z.string().min(1, "Proveedor requerido"),
  montoCLP: z.number().min(0, "Monto inválido"),
  fechaEmisionISO: z.string().min(1, "Fecha requerida"),
  etiquetas: z.string().optional(),
})

type FacturaFormData = z.infer<typeof facturaSchema>

interface FacturasTabProps {
  cursoId: string
  onRefresh: () => void
}

export function FacturasTab({ cursoId, onRefresh }: FacturasTabProps) {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      proveedor: "",
      montoCLP: 0,
      fechaEmisionISO: "",
      etiquetas: "",
      fileName: "",
      fileType: "pdf",
    },
  })

  const fileDisplay = useMemo(() => {
    if (!selectedFile) return null
    return `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`
  }, [selectedFile])

  const loadFacturas = async () => {
    setLoading(true)
    const data = await apiSimulada.getFacturas(cursoId)
    setFacturas(data)
    setLoading(false)
  }

  useEffect(() => {
    loadFacturas()
  }, [cursoId])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const ext = file.name.toLowerCase().split(".").pop()
    if (!ext || !["pdf", "jpg", "jpeg"].includes(ext)) {
      toast({ title: "Archivo no válido", description: "Solo se permiten PDF o JPG", variant: "destructive" })
      return
    }
    setSelectedFile(file)
    setValue("fileName", file.name)
    setValue("fileType", ext === "pdf" ? "pdf" : "jpg")
  }

  const onSubmit = async (data: FacturaFormData) => {
    const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : undefined
    const fallbackFileName = selectedFile?.name || "factura-demo.pdf"
    const fallbackFileType = selectedFile ? data.fileType : "pdf"

    setSaving(true)
    try {
      await apiSimulada.createFactura({
        cursoId,
        proveedor: data.proveedor,
        montoCLP: data.montoCLP,
        fechaEmisionISO: new Date(data.fechaEmisionISO).toISOString(),
        fileName: data.fileName || fallbackFileName,
        fileType: fallbackFileType,
        fileUrl,
        etiquetas: data.etiquetas,
      })
      toast({ title: "Factura registrada" })
      setDialogOpen(false)
      reset()
      setSelectedFile(null)
      loadFacturas()
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo registrar la factura", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const content =
    facturas.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay facturas registradas</h3>
          <p className="text-sm text-muted-foreground mb-4">Sube facturas relacionadas con este curso</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Subir factura
          </Button>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Facturas del curso</CardTitle>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Subir factura
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha emisión</TableHead>
                  <TableHead>Etiquetas</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facturas.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {factura.fileName}
                      </div>
                    </TableCell>
                    <TableCell>{factura.proveedor}</TableCell>
                    <TableCell className="font-mono">${factura.montoCLP?.toLocaleString("es-CL") || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(factura.fechaEmisionISO), "dd MMM yyyy", { locale: dateFnsEs })}
                    </TableCell>
                    <TableCell>
                      {factura.etiquetas ? (
                        <div className="flex gap-1 flex-wrap">
                          {factura.etiquetas.split(";").map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {factura.fileUrl && (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={factura.fileUrl} download={factura.fileName}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
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
            <DialogTitle>Subir factura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Archivo (PDF o JPG) *</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg" onChange={handleFileChange} />
              {fileDisplay && <p className="text-xs text-muted-foreground">Seleccionado: {fileDisplay}</p>}
              {!selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Si no adjuntas archivo se usará un placeholder de demo.
                </p>
              )}
              {errors.fileName && <p className="text-xs text-destructive">{errors.fileName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor / Razón social *</Label>
              <Input id="proveedor" {...register("proveedor")} placeholder="PR-0001 o nombre" />
              {errors.proveedor && <p className="text-xs text-destructive">{errors.proveedor.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="montoCLP">Monto (CLP) *</Label>
                <Input
                  id="montoCLP"
                  type="number"
                  {...register("montoCLP", { valueAsNumber: true })}
                  placeholder="45000"
                />
                {errors.montoCLP && <p className="text-xs text-destructive">{errors.montoCLP.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaEmisionISO">Fecha de emisión *</Label>
                <Input id="fechaEmisionISO" type="date" {...register("fechaEmisionISO")} />
                {errors.fechaEmisionISO && <p className="text-xs text-destructive">{errors.fechaEmisionISO.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="etiquetas">Etiquetas (separadas por ;) </Label>
              <Input id="etiquetas" {...register("etiquetas")} placeholder="OC-123;material médico" />
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
    </>
  )
}
