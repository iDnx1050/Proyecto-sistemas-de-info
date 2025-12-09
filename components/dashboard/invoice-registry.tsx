"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, Upload } from "lucide-react"
import { es } from "@/lib/i18n/es"
import { apiSimulada } from "@/lib/mock"
import type { FacturaGeneral } from "@/lib/types"
import { format } from "date-fns"
import { es as dateFnsEs } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

const normalizarIso = (iso: string) => iso.split("T")[0]
const normalizarInputFecha = (valor: string) => valor.split("T")[0]

type RegistroFacturasProps = {
  mostrarBotonVerTodas?: boolean
  mostrarFormulario?: boolean
}

export function InvoiceRegistry({ mostrarBotonVerTodas = false, mostrarFormulario = true }: RegistroFacturasProps) {
  const [facturas, setFacturas] = useState<FacturaGeneral[]>([])
  const [facturasFiltradas, setFacturasFiltradas] = useState<FacturaGeneral[]>([])
  const [filtroFecha, setFiltroFecha] = useState("")
  const [cargando, setCargando] = useState(false)
  const [datosFormulario, setDatosFormulario] = useState({
    fechaEmisionISO: "",
    proveedor: "",
    montoCLP: "",
    categoria: "" as FacturaGeneral["categoria"] | "",
    fileName: "",
    fileType: "pdf" as FacturaGeneral["fileType"],
  })
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const inputArchivoRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    apiSimulada.getFacturasGenerales().then((lista) => {
      setFacturas(lista)
      setFacturasFiltradas(lista)
    })
  }, [])

  useEffect(() => {
    if (!filtroFecha) {
      setFacturasFiltradas(facturas)
      return
    }
    const fechaBuscada = normalizarInputFecha(filtroFecha)
    const filtradas = facturas.filter((factura) => normalizarIso(factura.fechaEmisionISO) === fechaBuscada)
    setFacturasFiltradas(filtradas)
  }, [filtroFecha, facturas])

  const manejarArchivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    const extension = archivo.name.toLowerCase().split(".").pop()
    if (!extension || !["pdf", "jpg", "jpeg"].includes(extension)) {
      alert("Solo se permiten archivos PDF o JPG")
      evento.target.value = ""
      return
    }
    setArchivoSeleccionado(archivo)
    setDatosFormulario((previo) => ({
      ...previo,
      fileName: archivo.name,
      fileType: extension === "pdf" ? "pdf" : "jpg",
    }))
  }

  const manejarEnvio = async (evento: React.FormEvent) => {
    evento.preventDefault()
    if (!datosFormulario.fechaEmisionISO || !datosFormulario.proveedor || !datosFormulario.categoria || !datosFormulario.fileName) {
      alert("Por favor complete los campos obligatorios")
      return
    }
    if (!archivoSeleccionado) {
      alert("Adjunte un archivo PDF o JPG")
      return
    }

    setCargando(true)
    try {
      const nuevaFactura = await apiSimulada.createFacturaGeneral({
        fechaEmisionISO: new Date(datosFormulario.fechaEmisionISO).toISOString(),
        proveedor: datosFormulario.proveedor,
        montoCLP: datosFormulario.montoCLP ? Number.parseInt(datosFormulario.montoCLP) : undefined,
        categoria: datosFormulario.categoria as FacturaGeneral["categoria"],
        fileName: datosFormulario.fileName,
        fileType: datosFormulario.fileType,
        fileUrl: URL.createObjectURL(archivoSeleccionado),
      })
      setFacturas([nuevaFactura, ...facturas])
      setDatosFormulario({
        fechaEmisionISO: "",
        proveedor: "",
        montoCLP: "",
        categoria: "",
        fileName: "",
        fileType: "pdf",
      })
      setArchivoSeleccionado(null)
      if (inputArchivoRef.current) inputArchivoRef.current.value = ""
      // Refrescar filtro con la nueva lista
      setFiltroFecha("")
      setFacturasFiltradas([nuevaFactura, ...facturas])
    } catch (error) {
      console.error("Error al crear factura:", error)
    } finally {
      setCargando(false)
    }
  }

  const manejarEliminacion = async (id: string) => {
    if (!confirm("¿Eliminar esta factura?")) return
    await apiSimulada.deleteFacturaGeneral(id)
    const actualizadas = facturas.filter((factura) => factura.id !== id)
    setFacturas(actualizadas)
    setFacturasFiltradas(
      filtroFecha
        ? actualizadas.filter((factura) => factura.fechaEmisionISO.startsWith(filtroFecha))
        : actualizadas,
    )
  }

  const obtenerColorCategoria = (categoria: FacturaGeneral["categoria"]) => {
    const colores = {
      alimentacion: "bg-orange-100 text-orange-800",
      logistica: "bg-blue-100 text-blue-800",
      indumentaria: "bg-purple-100 text-purple-800",
      materiales: "bg-green-100 text-green-800",
      servicios: "bg-yellow-100 text-yellow-800",
      otro: "bg-gray-100 text-gray-800",
    }
    return colores[categoria]
  }

  return (
    <Card className="shadow-md w-full max-w-6xl">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-foreground">{es.dashboard.invoiceRegistry.title}</CardTitle>
          <CardDescription>Registre y gestione las facturas de gastos</CardDescription>
        </div>
        {mostrarBotonVerTodas && null}
      </CardHeader>
      <CardContent className="space-y-5 pb-4">
        {mostrarFormulario && (
          <form onSubmit={manejarEnvio} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="file">{es.dashboard.invoiceRegistry.uploadFile}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="text"
                  placeholder="archivo.pdf"
                  value={datosFormulario.fileName}
                  onChange={(e) => setDatosFormulario({ ...datosFormulario, fileName: e.target.value })}
                  required
                  readOnly
                />
                <input
                  ref={inputArchivoRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg"
                  className="hidden"
                  onChange={manejarArchivo}
                />
                <Button type="button" size="icon" variant="outline" onClick={() => inputArchivoRef.current?.click()}>
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              {archivoSeleccionado && (
                <p className="text-xs text-muted-foreground">
                  Seleccionado: {archivoSeleccionado.name} ({Math.round(archivoSeleccionado.size / 1024)} KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">{es.dashboard.invoiceRegistry.issueDate}</Label>
              <Input
                id="issueDate"
                type="date"
                value={datosFormulario.fechaEmisionISO}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, fechaEmisionISO: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">{es.dashboard.invoiceRegistry.supplier}</Label>
              <Input
                id="supplier"
                type="text"
                placeholder="Nombre del proveedor"
                value={datosFormulario.proveedor}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, proveedor: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{es.dashboard.invoiceRegistry.amount}</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={datosFormulario.montoCLP}
                onChange={(e) => setDatosFormulario({ ...datosFormulario, montoCLP: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{es.dashboard.invoiceRegistry.category}</Label>
              <Select
                value={datosFormulario.categoria}
                onValueChange={(valor) => setDatosFormulario({ ...datosFormulario, categoria: valor as FacturaGeneral["categoria"] })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleccionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alimentacion">{es.dashboard.invoiceRegistry.categories.alimentacion}</SelectItem>
                  <SelectItem value="logistica">{es.dashboard.invoiceRegistry.categories.logistica}</SelectItem>
                  <SelectItem value="indumentaria">{es.dashboard.invoiceRegistry.categories.indumentaria}</SelectItem>
                  <SelectItem value="materiales">{es.dashboard.invoiceRegistry.categories.materiales}</SelectItem>
                  <SelectItem value="servicios">{es.dashboard.invoiceRegistry.categories.servicios}</SelectItem>
                  <SelectItem value="otro">{es.dashboard.invoiceRegistry.categories.otro}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={cargando} className="w-full bg-[#5F7F32] hover:bg-[#5F7F32]/90">
                {es.dashboard.invoiceRegistry.submit}
              </Button>
            </div>
          </form>
        )}

        <div className="flex items-end justify-end gap-3">
          <div className="space-y-2 w-full sm:w-auto">
            <Label htmlFor="filtroFecha">Filtrar por fecha</Label>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="filtroFecha"
                    variant="outline"
                    className="justify-start text-left font-normal flex-1 min-w-[200px]"
                  >
                    {filtroFecha
                      ? format(new Date(filtroFecha), "dd-MM-yyyy", { locale: dateFnsEs })
                      : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filtroFecha ? new Date(filtroFecha) : undefined}
                    onSelect={(date) => setFiltroFecha(date ? format(date, "yyyy-MM-dd") : "")}
                    modifiers={{
                      conFactura: facturas.map((factura) => new Date(`${normalizarIso(factura.fechaEmisionISO)}T00:00:00`)),
                    }}
                    modifiersClassNames={{
                      conFactura: "bg-emerald-100 text-emerald-800 rounded-md",
                    }}
                  />
                </PopoverContent>
              </Popover>
              {filtroFecha && (
                <Button variant="outline" onClick={() => setFiltroFecha("")}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-lg max-h-72 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{es.dashboard.invoiceRegistry.table.file}</TableHead>
                <TableHead>{es.dashboard.invoiceRegistry.table.date}</TableHead>
                <TableHead>{es.dashboard.invoiceRegistry.table.supplier}</TableHead>
                <TableHead>{es.dashboard.invoiceRegistry.table.amount}</TableHead>
                <TableHead>{es.dashboard.invoiceRegistry.table.category}</TableHead>
                <TableHead className="text-right">{es.dashboard.invoiceRegistry.table.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay facturas registradas
                  </TableCell>
                </TableRow>
              ) : (
                facturasFiltradas.map((factura) => (
                  <TableRow key={factura.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#5F7F32]" />
                        <span className="text-sm">{factura.fileName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(factura.fechaEmisionISO), "dd MMM yyyy", { locale: dateFnsEs })}
                    </TableCell>
                    <TableCell>{factura.proveedor}</TableCell>
                    <TableCell>{factura.montoCLP ? `$${factura.montoCLP.toLocaleString()}` : "-"}</TableCell>
                    <TableCell>
                      <Badge className={obtenerColorCategoria(factura.categoria)} variant="secondary">
                        {es.dashboard.invoiceRegistry.categories[factura.categoria]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => window.open(factura.fileUrl, "_blank")}>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => manejarEliminacion(factura.id)}>
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
