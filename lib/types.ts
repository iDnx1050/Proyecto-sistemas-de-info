// Core TypeScript types for the logistics system

export type Curso = {
  id: string
  nombre: string
  tipo: "Primeros Auxilios" | "Prevenci�n de Riesgos" | "Evacuaci�n" | "Otro"
  fechaISO: string
  lugar: string
  asistentes: number
  responsable: string
  activo: boolean
  plantillaChecklistId: string
  createdAtISO: string
}

export type ChecklistItem = {
  id: string
  cursoId: string
  sku?: string
  item: string
  unidad: string
  qtyPlanificada: number
  cantidadPorPersona?: number
  origen: "bodega" | "compra"
  estado: "pendiente" | "listo" | "entregado"
  notas?: string
}

export type Inventario = {
  sku: string
  nombre: string
  talla?: string
  color?: string
  stock: number
  stockMin: number
  ubicacion?: string
  updatedAtISO: string
}

export type Movimiento = {
  id: string
  fechaISO: string
  tipo: "entrada" | "salida"
  sku: string
  cantidad: number
  referencia?: string
  usuario: string
}

export type Participante = {
  id: string
  cursoId: string
  nombre: string
  alergias?: string
  tallaPolera?: "XS" | "S" | "M" | "L" | "XL"
  isVegan?: boolean
}

export type Proveedor = {
  id: string
  nombre: string
  contacto?: string
  telefono?: string
  telefono2?: string
  direccion?: string
  web?: string
}

export type Factura = {
  id: string
  cursoId: string
  proveedor: string
  montoCLP: number
  fechaEmisionISO: string
  fileName: string
  fileType: "pdf" | "jpg" | "png"
  fileUrl?: string
  etiquetas?: string
  createdAtISO: string
}

export type FacturaGeneral = {
  id: string
  fechaEmisionISO: string
  proveedor: string
  montoCLP?: number
  categoria: "alimentacion" | "logistica" | "indumentaria" | "materiales" | "servicios" | "otro"
  fileName: string
  fileType: "pdf" | "jpg" | "png"
  fileUrl?: string
  createdAtISO: string
}

export type UserRole = "admin" | "instructor" | "lectura"

export type PlantillaChecklist = {
  id: string
  nombre: string
  tipo: Curso["tipo"]
  items: {
    item: string
    unidad: string
    cantidadPorPersona: number
    sku?: string
  }[]
}

