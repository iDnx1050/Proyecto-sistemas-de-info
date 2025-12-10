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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ""
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !API_BASE

const emitUpdate = (topic: string) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("demo-data-update", { detail: topic }))
  }
}

const loadLocalPlantillas = (): PlantillaChecklist[] => {
  if (typeof window === "undefined") return []
  const saved = window.localStorage.getItem("demo-course-types")
  if (!saved) return []
  try {
    return JSON.parse(saved) as PlantillaChecklist[]
  } catch {
    return []
  }
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `id-${Math.random().toString(16).slice(2)}`

// Datos base minimalistas para que el usuario agregue los suyos.
const store = {
  cursos: [
    {
      id: "cur-primeros",
      nombre: "Primeros Auxilios Comunitarios",
      tipo: "Primeros Auxilios" as Curso["tipo"],
      fechaISO: new Date().toISOString(),
      lugar: "Santiago",
      asistentes: 180,
      responsable: "Ana Rivas",
      activo: true,
      plantillaChecklistId: "tpl-primeros",
      createdAtISO: new Date().toISOString(),
    },
    {
      id: "cur-evac",
      nombre: "Evacuación en edificios",
      tipo: "Evacuación" as Curso["tipo"],
      fechaISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lugar: "Valparaíso",
      asistentes: 240,
      responsable: "Luis Venegas",
      activo: true,
      plantillaChecklistId: "tpl-evacuacion",
      createdAtISO: new Date().toISOString(),
    },
    {
      id: "cur-log",
      nombre: "Logística de eventos críticos",
      tipo: "Logistica" as Curso["tipo"],
      fechaISO: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      lugar: "Concepción",
      asistentes: 320,
      responsable: "Camila Ortega",
      activo: false,
      plantillaChecklistId: "tpl-logistica",
      createdAtISO: new Date().toISOString(),
    },
  ] as Curso[],
  plantillas: [
    {
      id: "tpl-primeros",
      nombre: "Primeros auxilios",
      tipo: "Primeros Auxilios" as Curso["tipo"],
      items: [
        { item: "Botiquin completo", unidad: "unidad", cantidadPorPersona: 1, sku: "SKU-BOTI" },
        { item: "Guantes nitrilo", unidad: "par", cantidadPorPersona: 1, sku: "SKU-GUANTES" },
        { item: "Linterna", unidad: "unidad", cantidadPorPersona: 0.2, sku: "SKU-LINTERNA" },
      ],
    },
    {
      id: "tpl-evacuacion",
      nombre: "Evacuacion y brigada",
      tipo: "Evacuación" as Curso["tipo"],
      items: [
        { item: "Chaleco reflectante", unidad: "unidad", cantidadPorPersona: 1, sku: "SKU-CHALECO" },
        { item: "Cono de seguridad", unidad: "unidad", cantidadPorPersona: 0.5, sku: "SKU-CONOS" },
        { item: "Megafono", unidad: "unidad", cantidadPorPersona: 0.05, sku: "SKU-MEGA" },
      ],
    },
    {
      id: "tpl-logistica",
      nombre: "Logistica y montaje",
      tipo: "Logistica" as Curso["tipo"],
      items: [
        { item: "Carpa plegable", unidad: "unidad", cantidadPorPersona: 0.05, sku: "SKU-CARPA" },
        { item: "Mesa plegable", unidad: "unidad", cantidadPorPersona: 0.05, sku: "SKU-MESA" },
        { item: "Silla plegable", unidad: "unidad", cantidadPorPersona: 1, sku: "SKU-SILLA" },
      ],
    },
  ] as PlantillaChecklist[],
  inventario: [
    { sku: "SKU-BOTI", nombre: "Botiquin basico", stock: 25, stockMin: 5, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-GUANTES", nombre: "Guantes nitrilo talla M", stock: 100, stockMin: 20, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-CHALECO", nombre: "Chaleco reflectante", stock: 40, stockMin: 10, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-CONOS", nombre: "Cono de seguridad", stock: 30, stockMin: 8, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-LINTERNA", nombre: "Linterna LED recargable", stock: 12, stockMin: 4, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-MEGA", nombre: "Megafono 30W", stock: 4, stockMin: 2, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-CARPA", nombre: "Carpa plegable 3x3", stock: 3, stockMin: 1, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-MESA", nombre: "Mesa plegable plastica", stock: 6, stockMin: 2, updatedAtISO: new Date().toISOString() },
    { sku: "SKU-SILLA", nombre: "Silla plegable", stock: 60, stockMin: 20, updatedAtISO: new Date().toISOString() },
  ] as Inventario[],
  movimientos: [] as Movimiento[],
  checklistItems: [
    {
      id: "chk-demo",
      cursoId: "cur-demo",
      sku: "SKU-BOTI",
      item: "Botiquin completo",
      unidad: "unidad",
      qtyPlanificada: 10,
      cantidadPorPersona: 1,
      origen: "bodega",
      estado: "pendiente",
    },
  ] as ChecklistItem[],
  participantes: [{ id: "par-demo", cursoId: "cur-demo", nombre: "Participante demo" }] as Participante[],
  proveedores: [{ id: "prov-demo", nombre: "Proveedor demo", contacto: "demo@proveedor.cl" }] as Proveedor[],
  facturas: [
    {
      id: "fac-curso-001",
      cursoId: "cur-primeros",
      proveedor: "Catering Rescate",
      montoCLP: 140000,
      fechaEmisionISO: new Date().toISOString(),
      categoria: "alimentacion",
      fileName: "factura-catering.pdf",
      fileType: "pdf",
      fileUrl: "/docs/factura-catering.pdf",
      etiquetas: "alimentacion;curso",
      createdAtISO: new Date().toISOString(),
    },
    {
      id: "fac-curso-002",
      cursoId: "cur-evac",
      proveedor: "Logística Urbana",
      montoCLP: 220000,
      fechaEmisionISO: new Date().toISOString(),
      categoria: "logistica",
      fileName: "factura-logistica.pdf",
      fileType: "pdf",
      fileUrl: "/docs/factura-logistica.pdf",
      etiquetas: "transporte;equipamiento",
      createdAtISO: new Date().toISOString(),
    },
    {
      id: "fac-curso-003",
      cursoId: "cur-log",
      proveedor: "Servicios Técnicos",
      montoCLP: 90000,
      fechaImisionISO: new Date().toISOString(),
      categoria: "servicios",
      fileName: "factura-servicios.pdf",
      fileType: "pdf",
      fileUrl: "/docs/factura-servicios.pdf",
      etiquetas: "audio;montaje",
      createdAtISO: new Date().toISOString(),
    },
  ] as Factura[],
  facturasGenerales: [] as FacturaGeneral[],
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (DEMO_MODE) {
    // En modo demo no se hace fetch; se resuelve con un error para forzar el fallback de abajo.
    throw new Error("DEMO_MODE")
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || `Error ${res.status}`)
  }
  return res.json()
}

export const apiSimulada = {
  // Cursos
  async getCursos(): Promise<Curso[]> {
    if (DEMO_MODE) return [...store.cursos]
    return apiFetch<Curso[]>("/api/cursos")
  },
  async getCurso(id: string): Promise<Curso | null> {
    if (DEMO_MODE) return store.cursos.find((c) => c.id === id) || null
    return apiFetch<Curso>(`/api/cursos/${id}`).catch(() => null)
  },
  async createCurso(curso: Omit<Curso, "id" | "createdAtISO">): Promise<Curso> {
    if (DEMO_MODE) {
      const nuevo: Curso = { ...curso, id: uid(), createdAtISO: new Date().toISOString() }
      store.cursos.unshift(nuevo)
      if (nuevo.plantillaChecklistId && nuevo.asistentes) {
        try {
          await this.generateChecklistFromTemplate(nuevo.id, nuevo.plantillaChecklistId, nuevo.asistentes)
          emitUpdate("checklistItems")
        } catch {
          // ignore in demo if falla
        }
      }
      return nuevo
    }
    return apiFetch<Curso>("/api/cursos", { method: "POST", body: JSON.stringify(curso) })
  },
  async updateCurso(id: string, updates: Partial<Curso>): Promise<Curso | null> {
    if (DEMO_MODE) {
      const idx = store.cursos.findIndex((c) => c.id === id)
      if (idx === -1) return null
      store.cursos[idx] = { ...store.cursos[idx], ...updates }
      return store.cursos[idx]
    }
    return apiFetch<Curso>(`/api/cursos/${id}`, { method: "PUT", body: JSON.stringify(updates) }).catch(() => null)
  },
  async deleteCurso(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.cursos = store.cursos.filter((c) => c.id !== id)
      store.checklistItems = store.checklistItems.filter((i) => i.cursoId !== id)
      store.participantes = store.participantes.filter((p) => p.cursoId !== id)
      store.facturas = store.facturas.filter((f) => f.cursoId !== id)
      return true
    }
    await apiFetch(`/api/cursos/${id}`, { method: "DELETE" })
    return true
  },

  // Plantillas
  async getPlantillas(): Promise<PlantillaChecklist[]> {
    if (DEMO_MODE) return [...store.plantillas, ...loadLocalPlantillas()]
    return apiFetch<PlantillaChecklist[]>("/api/plantillas")
  },
  async getPlantilla(id: string): Promise<PlantillaChecklist | null> {
    if (DEMO_MODE) return [...store.plantillas, ...loadLocalPlantillas()].find((p) => p.id === id) || null
    return apiFetch<PlantillaChecklist>(`/api/plantillas/${id}`).catch(() => null)
  },

  async generateChecklistFromTemplate(cursoId: string, plantillaId: string, asistentes: number) {
    if (DEMO_MODE) {
      const plantilla = [...store.plantillas, ...loadLocalPlantillas()].find((p) => p.id === plantillaId)
      if (!plantilla) throw new Error("Plantilla no encontrada")
      const created = plantilla.items.map<ChecklistItem>((item) => ({
        id: uid(),
        cursoId,
        sku: item.sku,
        item: item.item,
        unidad: item.unidad,
        qtyPlanificada: Math.max(1, Math.round(item.cantidadPorPersona * asistentes)),
        cantidadPorPersona: item.cantidadPorPersona,
        origen: item.sku ? "bodega" : "compra",
        estado: "pendiente",
      }))
      store.checklistItems = [...store.checklistItems.filter((i) => i.cursoId !== cursoId), ...created]
      return created
    }
    return apiFetch<ChecklistItem[]>("/api/checklist-items/generate", {
      method: "POST",
      body: JSON.stringify({ cursoId, plantillaId, asistentes }),
    })
  },

  // Checklist
  async getChecklistItems(cursoId?: string): Promise<ChecklistItem[]> {
    if (DEMO_MODE) return cursoId ? store.checklistItems.filter((i) => i.cursoId === cursoId) : [...store.checklistItems]
    const query = cursoId ? `?cursoId=${cursoId}` : ""
    return apiFetch<ChecklistItem[]>(`/api/checklist-items${query}`)
  },
  async createChecklistItem(item: Omit<ChecklistItem, "id">): Promise<ChecklistItem> {
    if (DEMO_MODE) {
      const nuevo: ChecklistItem = { ...item, id: uid() }
      store.checklistItems.push(nuevo)
      return nuevo
    }
    return apiFetch<ChecklistItem>("/api/checklist-items", { method: "POST", body: JSON.stringify(item) })
  },
  async updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    if (DEMO_MODE) {
      const idx = store.checklistItems.findIndex((i) => i.id === id)
      if (idx === -1) return null
      store.checklistItems[idx] = { ...store.checklistItems[idx], ...updates }
      return store.checklistItems[idx]
    }
    return apiFetch<ChecklistItem>(`/api/checklist-items/${id}`, { method: "PUT", body: JSON.stringify(updates) }).catch(
      () => null,
    )
  },
  async deleteChecklistItem(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.checklistItems = store.checklistItems.filter((i) => i.id !== id)
      return true
    }
    await apiFetch(`/api/checklist-items/${id}`, { method: "DELETE" })
    return true
  },

  // Inventario
  async getInventario(): Promise<Inventario[]> {
    if (DEMO_MODE) return [...store.inventario]
    return apiFetch<Inventario[]>("/api/inventario")
  },
  async createInventarioItem(item: Omit<Inventario, "updatedAtISO">): Promise<Inventario> {
    if (DEMO_MODE) {
      const nuevo: Inventario = { ...item, updatedAtISO: new Date().toISOString() }
      store.inventario.push(nuevo)
      store.movimientos.unshift({
        id: uid(),
        fechaISO: new Date().toISOString(),
        tipo: "entrada",
        sku: nuevo.sku,
        cantidad: nuevo.stock,
        referencia: "Alta de inventario",
        usuario: "demo@ong.cl",
      })
      emitUpdate("inventario")
      emitUpdate("movimientos")
      return nuevo
    }
    return apiFetch<Inventario>("/api/inventario", { method: "POST", body: JSON.stringify(item) })
  },
  async updateInventarioItem(sku: string, updates: Partial<Inventario>): Promise<Inventario | null> {
    if (DEMO_MODE) {
      const idx = store.inventario.findIndex((i) => i.sku === sku)
      if (idx === -1) return null
      store.inventario[idx] = { ...store.inventario[idx], ...updates, updatedAtISO: new Date().toISOString() }
      emitUpdate("inventario")
      return store.inventario[idx]
    }
    return apiFetch<Inventario>(`/api/inventario/${sku}`, { method: "PUT", body: JSON.stringify(updates) }).catch(() => null)
  },
  async deleteInventarioItem(sku: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.inventario = store.inventario.filter((i) => i.sku !== sku)
      emitUpdate("inventario")
      return true
    }
    await apiFetch(`/api/inventario/${sku}`, { method: "DELETE" })
    return true
  },
  async adjustStock(
    sku: string,
    cantidad: number,
    tipo: "entrada" | "salida",
    referencia?: string,
    usuario?: string,
  ) {
    if (DEMO_MODE) {
      const item = store.inventario.find((i) => i.sku === sku)
      if (!item) throw new Error("SKU no encontrado")
      const delta = tipo === "entrada" ? cantidad : -cantidad
      item.stock = Math.max(0, item.stock + delta)
      item.updatedAtISO = new Date().toISOString()
      store.movimientos.unshift({
        id: uid(),
        fechaISO: new Date().toISOString(),
        tipo,
        sku,
        cantidad,
        referencia,
        usuario: usuario || "demo@ong.cl",
      })
      emitUpdate("inventario")
      emitUpdate("movimientos")
      return { ok: true }
    }
    return apiFetch("/api/inventario/ajustar", {
      method: "POST",
      body: JSON.stringify({ sku, cantidad, tipo, referencia, usuario }),
    })
  },

  async getMovimientos(): Promise<Movimiento[]> {
    if (DEMO_MODE) return [...store.movimientos]
    return apiFetch<Movimiento[]>("/api/movimientos")
  },

  // Participantes
  async getParticipantes(cursoId?: string): Promise<Participante[]> {
    if (DEMO_MODE) return cursoId ? store.participantes.filter((p) => p.cursoId === cursoId) : [...store.participantes]
    const query = cursoId ? `?cursoId=${cursoId}` : ""
    return apiFetch<Participante[]>(`/api/participantes${query}`)
  },
  async createParticipante(participante: Omit<Participante, "id">): Promise<Participante> {
    if (DEMO_MODE) {
      const nuevo: Participante = { ...participante, id: uid() }
      store.participantes.push(nuevo)
      return nuevo
    }
    return apiFetch<Participante>("/api/participantes", { method: "POST", body: JSON.stringify(participante) })
  },
  async deleteParticipante(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.participantes = store.participantes.filter((p) => p.id !== id)
      return true
    }
    await apiFetch(`/api/participantes/${id}`, { method: "DELETE" })
    return true
  },

  // Proveedores
  async getProveedores(): Promise<Proveedor[]> {
    if (DEMO_MODE) return [...store.proveedores]
    return apiFetch<Proveedor[]>("/api/proveedores")
  },
  async createProveedor(proveedor: Omit<Proveedor, "id">): Promise<Proveedor> {
    if (DEMO_MODE) {
      const nuevo: Proveedor = { ...proveedor, id: uid() }
      store.proveedores.push(nuevo)
      return nuevo
    }
    return apiFetch<Proveedor>("/api/proveedores", { method: "POST", body: JSON.stringify(proveedor) })
  },
  async updateProveedor(id: string, updates: Partial<Proveedor>): Promise<Proveedor | null> {
    if (DEMO_MODE) {
      const idx = store.proveedores.findIndex((p) => p.id === id)
      if (idx === -1) return null
      store.proveedores[idx] = { ...store.proveedores[idx], ...updates }
      return store.proveedores[idx]
    }
    return apiFetch<Proveedor>(`/api/proveedores/${id}`, { method: "PUT", body: JSON.stringify(updates) }).catch(() => null)
  },
  async deleteProveedor(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.proveedores = store.proveedores.filter((p) => p.id !== id)
      return true
    }
    await apiFetch(`/api/proveedores/${id}`, { method: "DELETE" })
    return true
  },

  // Facturas
  async getFacturas(cursoId?: string): Promise<Factura[]> {
    if (DEMO_MODE) return cursoId ? store.facturas.filter((f) => f.cursoId === cursoId) : [...store.facturas]
    const query = cursoId ? `?cursoId=${cursoId}` : ""
    return apiFetch<Factura[]>(`/api/facturas${query}`)
  },
  async createFactura(factura: Omit<Factura, "id" | "createdAtISO">): Promise<Factura> {
    if (DEMO_MODE) {
      const nueva: Factura = { ...factura, id: uid(), createdAtISO: new Date().toISOString() }
      store.facturas.unshift(nueva)
      emitUpdate("facturas")
      return nueva
    }
    return apiFetch<Factura>("/api/facturas", { method: "POST", body: JSON.stringify(factura) })
  },
  async deleteFactura(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.facturas = store.facturas.filter((f) => f.id !== id)
      emitUpdate("facturas")
      return true
    }
    await apiFetch(`/api/facturas/${id}`, { method: "DELETE" })
    return true
  },

  // Facturas Generales (alias al mismo origen)
  async getFacturasGenerales(): Promise<FacturaGeneral[]> {
    if (DEMO_MODE) return [...store.facturasGenerales]
    return apiFetch<FacturaGeneral[]>("/api/facturas-generales")
  },
  async createFacturaGeneral(factura: Omit<FacturaGeneral, "id" | "createdAtISO">): Promise<FacturaGeneral> {
    if (DEMO_MODE) {
      const nueva: FacturaGeneral = { ...factura, id: uid(), createdAtISO: new Date().toISOString() }
      store.facturasGenerales.unshift(nueva)
      emitUpdate("facturasGenerales")
      return nueva
    }
    return apiFetch<FacturaGeneral>("/api/facturas", { method: "POST", body: JSON.stringify(factura) })
  },
  async deleteFacturaGeneral(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.facturasGenerales = store.facturasGenerales.filter((f) => f.id !== id)
      emitUpdate("facturasGenerales")
      return true
    }
    await apiFetch(`/api/facturas-generales/${id}`, { method: "DELETE" })
    return true
  },
}
