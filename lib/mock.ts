// Mock data service - now without seed data (ready for production data entry)

import type {
  Curso,
  ChecklistItem,
  Inventario,
  Movimiento,
  Participante,
  Proveedor,
  Factura,
  FacturaGeneral,
  PlantillaChecklist,
} from "./types"

// Simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock data stores (empty – fill via UI)
const cursos: Curso[] = []
let checklistItems: ChecklistItem[] = []
const inventario: Inventario[] = []
const movimientos: Movimiento[] = []
let participantes: Participante[] = []
const proveedores: Proveedor[] = []
let facturas: Factura[] = []
let facturasGenerales: FacturaGeneral[] = []
const plantillasChecklist: PlantillaChecklist[] = []

const STORAGE_COURSE_TYPES = "demo-course-types"

const loadPlantillasLocales = (): PlantillaChecklist[] => {
  if (typeof window === "undefined") return []
  try {
    const saved = window.localStorage.getItem(STORAGE_COURSE_TYPES)
    return saved ? (JSON.parse(saved) as PlantillaChecklist[]) : []
  } catch (error) {
    console.error("No se pudieron cargar plantillas locales", error)
    return []
  }
}

// API functions
export const apiSimulada = {
  // Cursos
  async getCursos(): Promise<Curso[]> {
    await delay()
    return [...cursos]
  },

  async getCurso(id: string): Promise<Curso | null> {
    await delay()
    return cursos.find((c) => c.id === id) || null
  },

  async createCurso(curso: Omit<Curso, "id" | "createdAtISO">): Promise<Curso> {
    await delay()
    const newCurso: Curso = {
      ...curso,
      activo: curso.activo ?? true,
      id: `C-${String(cursos.length + 1).padStart(4, "0")}`,
      createdAtISO: new Date().toISOString(),
    }
    cursos.push(newCurso)
    return newCurso
  },

  async updateCurso(id: string, updates: Partial<Curso>): Promise<Curso | null> {
    await delay()
    const index = cursos.findIndex((c) => c.id === id)
    if (index === -1) return null
    cursos[index] = { ...cursos[index], ...updates }
    return cursos[index]
  },

  async deleteCurso(id: string): Promise<boolean> {
    await delay()
    const index = cursos.findIndex((c) => c.id === id)
    if (index === -1) return false
    cursos.splice(index, 1)
    checklistItems = checklistItems.filter((item) => item.cursoId !== id)
    participantes = participantes.filter((p) => p.cursoId !== id)
    const facturasCursoIds = facturas.filter((f) => f.cursoId === id).map((f) => f.id)
    facturas = facturas.filter((f) => f.cursoId !== id)
    if (facturasCursoIds.length) {
      facturasGenerales = facturasGenerales.filter((fg) => !facturasCursoIds.includes(fg.id))
    }
    return true
  },

  // Checklist
  async getChecklistItems(cursoId: string): Promise<ChecklistItem[]> {
    await delay()
    return checklistItems.filter((item) => item.cursoId === cursoId)
  },

  async createChecklistItem(item: Omit<ChecklistItem, "id">): Promise<ChecklistItem> {
    await delay()
    const newItem: ChecklistItem = {
      ...item,
      id: `CL-${String(checklistItems.length + 1).padStart(4, "0")}`,
    }
    checklistItems.push(newItem)
    return newItem
  },

  async updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    await delay()
    const index = checklistItems.findIndex((item) => item.id === id)
    if (index === -1) return null
    checklistItems[index] = { ...checklistItems[index], ...updates }
    return checklistItems[index]
  },

  async deleteChecklistItem(id: string): Promise<boolean> {
    await delay()
    const index = checklistItems.findIndex((item) => item.id === id)
    if (index === -1) return false
    checklistItems.splice(index, 1)
    return true
  },

  async generateChecklistFromTemplate(
    cursoId: string,
    plantillaId: string,
    asistentes: number,
  ): Promise<ChecklistItem[]> {
    await delay()
    const locales = loadPlantillasLocales()
    const plantilla = [...plantillasChecklist, ...locales].find((p) => p.id === plantillaId)
    if (!plantilla) return []

    const newItems: ChecklistItem[] = plantilla.items.map((templateItem, index) => ({
      id: `CL-${String(checklistItems.length + index + 1).padStart(4, "0")}`,
      cursoId,
      sku: templateItem.sku,
      item: templateItem.item,
      unidad: templateItem.unidad,
      qtyPlanificada: Math.ceil(templateItem.cantidadPorPersona * asistentes),
      cantidadPorPersona: templateItem.cantidadPorPersona,
      origen: templateItem.sku ? "bodega" : "compra",
      estado: "pendiente",
    }))

    checklistItems.push(...newItems)
    return newItems
  },

  // Inventario
  async getInventario(): Promise<Inventario[]> {
    await delay()
    return [...inventario]
  },

  async getInventarioItem(sku: string): Promise<Inventario | null> {
    await delay()
    return inventario.find((item) => item.sku === sku) || null
  },

  async createInventarioItem(item: Omit<Inventario, "updatedAtISO">): Promise<Inventario> {
    await delay()
    const newItem: Inventario = {
      ...item,
      updatedAtISO: new Date().toISOString(),
    }
    inventario.push(newItem)
    if (newItem.stock > 0) {
      const movimiento: Movimiento = {
        id: `M-${String(movimientos.length + 1).padStart(4, "0")}`,
        fechaISO: new Date().toISOString(),
        tipo: "entrada",
        sku: newItem.sku,
        cantidad: newItem.stock,
        referencia: "Creacion de item",
        usuario: "system@ong.cl",
      }
      movimientos.push(movimiento)
    }
    return newItem
  },

  async updateInventarioItem(sku: string, updates: Partial<Inventario>): Promise<Inventario | null> {
    await delay()
    const index = inventario.findIndex((item) => item.sku === sku)
    if (index === -1) return null
    inventario[index] = {
      ...inventario[index],
      ...updates,
      updatedAtISO: new Date().toISOString(),
    }
    return inventario[index]
  },

  async deleteInventarioItem(sku: string): Promise<boolean> {
    await delay()
    const index = inventario.findIndex((item) => item.sku === sku)
    if (index === -1) return false
    inventario.splice(index, 1)
    return true
  },

  async adjustStock(
    sku: string,
    cantidad: number,
    tipo: "entrada" | "salida",
    referencia?: string,
    usuario = "system@ong.cl",
  ): Promise<{ inventario: Inventario; movimiento: Movimiento } | null> {
    await delay()
    const item = inventario.find((i) => i.sku === sku)
    if (!item) return null

    const newStock = tipo === "entrada" ? item.stock + cantidad : item.stock - cantidad
    if (newStock < 0) throw new Error("Stock insuficiente")

    item.stock = newStock
    item.updatedAtISO = new Date().toISOString()

    const movimiento: Movimiento = {
      id: `M-${String(movimientos.length + 1).padStart(4, "0")}`,
      fechaISO: new Date().toISOString(),
      tipo,
      sku,
      cantidad,
      referencia,
      usuario,
    }
    movimientos.push(movimiento)

    return { inventario: item, movimiento }
  },

  // Movimientos
  async getMovimientos(): Promise<Movimiento[]> {
    await delay()
    return [...movimientos].sort((a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime())
  },

  // Participantes
  async getParticipantes(cursoId?: string): Promise<Participante[]> {
    await delay()
    if (cursoId) {
      return participantes.filter((p) => p.cursoId === cursoId)
    }
    return [...participantes]
  },

  async createParticipante(participante: Omit<Participante, "id">): Promise<Participante> {
    await delay()
    const newParticipante: Participante = {
      ...participante,
      id: `P-${String(participantes.length + 1).padStart(4, "0")}`,
    }
    participantes.push(newParticipante)
    return newParticipante
  },

  async updateParticipante(id: string, updates: Partial<Participante>): Promise<Participante | null> {
    await delay()
    const index = participantes.findIndex((p) => p.id === id)
    if (index === -1) return null
    participantes[index] = { ...participantes[index], ...updates }
    return participantes[index]
  },

  async deleteParticipante(id: string): Promise<boolean> {
    await delay()
    const index = participantes.findIndex((p) => p.id === id)
    if (index === -1) return false
    participantes.splice(index, 1)
    return true
  },

  // Proveedores
  async getProveedores(): Promise<Proveedor[]> {
    await delay()
    return [...proveedores]
  },

  async createProveedor(proveedor: Omit<Proveedor, "id">): Promise<Proveedor> {
    await delay()
    const newProveedor: Proveedor = {
      ...proveedor,
      id: `PR-${String(proveedores.length + 1).padStart(4, "0")}`,
    }
    proveedores.push(newProveedor)
    return newProveedor
  },

  async updateProveedor(id: string, updates: Partial<Proveedor>): Promise<Proveedor | null> {
    await delay()
    const index = proveedores.findIndex((p) => p.id === id)
    if (index === -1) return null
    proveedores[index] = { ...proveedores[index], ...updates }
    return proveedores[index]
  },

  async deleteProveedor(id: string): Promise<boolean> {
    await delay()
    const index = proveedores.findIndex((p) => p.id === id)
    if (index === -1) return false
    proveedores.splice(index, 1)
    return true
  },

  // Facturas
  async getFacturas(cursoId?: string): Promise<Factura[]> {
    await delay()
    if (cursoId) {
      return facturas.filter((f) => f.cursoId === cursoId)
    }
    return [...facturas]
  },

  async createFactura(factura: Omit<Factura, "id" | "createdAtISO">): Promise<Factura> {
    await delay()
    const newFactura: Factura = {
      ...factura,
      id: `F-${String(facturas.length + 1).padStart(4, "0")}`,
      createdAtISO: new Date().toISOString(),
    }
    facturas.push(newFactura)
    const nuevaGeneral: FacturaGeneral = {
      id: newFactura.id,
      fechaEmisionISO: newFactura.fechaEmisionISO,
      proveedor: newFactura.proveedor,
      montoCLP: newFactura.montoCLP,
      categoria: "otro",
      fileName: newFactura.fileName,
      fileType: newFactura.fileType,
      fileUrl: newFactura.fileUrl,
      createdAtISO: newFactura.createdAtISO,
    }
    facturasGenerales.push(nuevaGeneral)
    return newFactura
  },

  async deleteFactura(id: string): Promise<boolean> {
    await delay()
    const index = facturas.findIndex((f) => f.id === id)
    if (index === -1) return false
    facturas.splice(index, 1)
    const indexGeneral = facturasGenerales.findIndex((f) => f.id === id)
    if (indexGeneral !== -1) facturasGenerales.splice(indexGeneral, 1)
    return true
  },

  // Facturas Generales
  async getFacturasGenerales(): Promise<FacturaGeneral[]> {
    await delay()
    return [...facturasGenerales].sort(
      (a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime(),
    )
  },

  async createFacturaGeneral(factura: Omit<FacturaGeneral, "id" | "createdAtISO">): Promise<FacturaGeneral> {
    await delay()
    const newFactura: FacturaGeneral = {
      ...factura,
      id: `FG-${String(facturasGenerales.length + 1).padStart(4, "0")}`,
      createdAtISO: new Date().toISOString(),
    }
    facturasGenerales.push(newFactura)
    return newFactura
  },

  async deleteFacturaGeneral(id: string): Promise<boolean> {
    await delay()
    const index = facturasGenerales.findIndex((f) => f.id === id)
    if (index === -1) return false
    facturasGenerales.splice(index, 1)
    return true
  },

  // Plantillas
  async getPlantillas(): Promise<PlantillaChecklist[]> {
    await delay()
    const locales = loadPlantillasLocales()
    return [...plantillasChecklist, ...locales]
  },

  async getPlantilla(id: string): Promise<PlantillaChecklist | null> {
    await delay()
    const locales = loadPlantillasLocales()
    return [...plantillasChecklist, ...locales].find((p) => p.id === id) || null
  },
}
