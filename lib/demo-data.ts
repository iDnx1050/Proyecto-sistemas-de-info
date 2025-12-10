import type {
  ChecklistItem,
  Curso,
  Factura,
  FacturaGeneral,
  Inventario,
  Movimiento,
  Participante,
  PlantillaChecklist,
  Proveedor,
} from "./types"

const today = new Date()
const iso = (d: Date) => d.toISOString()

export const demoCursos: Curso[] = [
  {
    id: "cur-001",
    nombre: "Primeros Auxilios Nivel I",
    tipo: "Primeros Auxilios",
    fechaISO: iso(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
    lugar: "Santiago",
    asistentes: 18,
    responsable: "Ana Rivas",
    activo: true,
    plantillaChecklistId: "tpl-001",
    createdAtISO: iso(today),
  },
  {
    id: "cur-002",
    nombre: "Prevenci𡆀南 de Riesgos Industrial",
    tipo: "Prevenci𡆀南 de Riesgos",
    fechaISO: iso(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
    lugar: "Valparaﾙso",
    asistentes: 22,
    responsable: "Luis Venegas",
    activo: true,
    plantillaChecklistId: "tpl-002",
    createdAtISO: iso(today),
  },
  {
    id: "cur-003",
    nombre: "Evacuaci𡆀南 y Emergencias",
    tipo: "Evacuaci𡆀南",
    fechaISO: iso(new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000)),
    lugar: "Concepci𡆀南",
    asistentes: 15,
    responsable: "Camila Ortega",
    activo: false,
    plantillaChecklistId: "tpl-001",
    createdAtISO: iso(today),
  },
]

export const demoPlantillas: PlantillaChecklist[] = [
  {
    id: "tpl-001",
    nombre: "Curso bᥴico",
    tipo: "Primeros Auxilios",
    items: [
      { item: "Botiquines", unidad: "unidad", cantidadPorPersona: 1, sku: "SKU-BOTI" },
      { item: "Agua 1L", unidad: "botella", cantidadPorPersona: 1 },
      { item: "Chalecos reflectantes", unidad: "unidad", cantidadPorPersona: 1, sku: "SKU-CHALECO" },
    ],
  },
  {
    id: "tpl-002",
    nombre: "Prevenci𡆀南",
    tipo: "Prevenci𡆀南 de Riesgos",
    items: [
      { item: "Se𢃼l閠ica", unidad: "set", cantidadPorPersona: 0.1 },
      { item: "Extintor 5kg", unidad: "unidad", cantidadPorPersona: 0.05 },
    ],
  },
]

export const demoInventario: Inventario[] = [
  {
    sku: "SKU-BOTI",
    nombre: "Botiquin completo",
    talla: undefined,
    color: undefined,
    stock: 25,
    stockMin: 10,
    ubicacion: "Bodega A",
    updatedAtISO: iso(today),
  },
  {
    sku: "SKU-CHALECO",
    nombre: "Chaleco reflectante",
    talla: "M",
    color: "Amarillo",
    stock: 40,
    stockMin: 15,
    ubicacion: "Bodega B",
    updatedAtISO: iso(today),
  },
  {
    sku: "SKU-CONO",
    nombre: "Cono de seguridad",
    talla: undefined,
    color: "Naranja",
    stock: 30,
    stockMin: 8,
    ubicacion: "Bodega B",
    updatedAtISO: iso(today),
  },
]

export const demoMovimientos: Movimiento[] = [
  {
    id: "mov-001",
    fechaISO: iso(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
    tipo: "entrada",
    sku: "SKU-BOTI",
    cantidad: 10,
    referencia: "Ingreso proveedor",
    usuario: "system@ong.cl",
  },
  {
    id: "mov-002",
    fechaISO: iso(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
    tipo: "salida",
    sku: "SKU-CHALECO",
    cantidad: 5,
    referencia: "Curso cur-001",
    usuario: "system@ong.cl",
  },
]

export const demoChecklistItems: ChecklistItem[] = [
  {
    id: "chk-001",
    cursoId: "cur-001",
    sku: "SKU-BOTI",
    item: "Botiquines",
    unidad: "unidad",
    qtyPlanificada: 18,
    cantidadPorPersona: 1,
    origen: "bodega",
    estado: "pendiente",
    notas: "Revisar vencimientos",
  },
  {
    id: "chk-002",
    cursoId: "cur-001",
    sku: "SKU-CHALECO",
    item: "Chalecos reflectantes",
    unidad: "unidad",
    qtyPlanificada: 18,
    cantidadPorPersona: 1,
    origen: "bodega",
    estado: "listo",
  },
]

export const demoParticipantes: Participante[] = [
  { id: "par-001", cursoId: "cur-001", nombre: "Sofꮡ Riquelme", tallaPolera: "M", isVegan: false },
  { id: "par-002", cursoId: "cur-001", nombre: "Carlos Mella", tallaPolera: "L", isVegan: true },
]

export const demoProveedores: Proveedor[] = [
  {
    id: "prov-001",
    nombre: "Suministros Andes",
    contacto: "contacto@suministros.cl",
    telefono: "+56 9 1111 1111",
    direccion: "Av. Central 123, Santiago",
    web: "https://suministros.cl",
  },
  {
    id: "prov-002",
    nombre: "Logⅱstica Sur",
    contacto: "ventas@logisticasur.cl",
    telefono: "+56 9 2222 2222",
    direccion: "Los Carrera 456, Concepci𡆀南",
    web: "https://logisticasur.cl",
  },
]

export const demoFacturas: Factura[] = [
  {
    id: "fac-001",
    cursoId: "cur-001",
    proveedor: "Suministros Andes",
    montoCLP: 125000,
    fechaEmisionISO: iso(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)),
    categoria: "materiales",
    fileName: "factura-001.pdf",
    fileType: "pdf",
    fileUrl: "/docs/factura-001.pdf",
    etiquetas: "OC-123;curso cur-001",
    createdAtISO: iso(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)),
  },
]

export const demoFacturasGenerales: FacturaGeneral[] = [
  {
    id: "facg-001",
    proveedor: "Logⅱstica Sur",
    montoCLP: 90000,
    fechaEmisionISO: iso(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)),
    categoria: "servicios",
    fileName: "factura-logistica.pdf",
    fileType: "pdf",
    fileUrl: "/docs/factura-logistica.pdf",
    createdAtISO: iso(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)),
  },
]
