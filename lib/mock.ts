import {
  demoChecklistItems,
  demoCursos,
  demoFacturas,
  demoFacturasGenerales,
  demoInventario,
  demoMovimientos,
  demoParticipantes,
  demoPlantillas,
  demoProveedores,
} from "./demo-data"
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

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `id-${Math.random().toString(16).slice(2)}`

const store = {
  cursos: [...demoCursos],
  plantillas: [...demoPlantillas],
  inventario: [...demoInventario],
  movimientos: [...demoMovimientos],
  checklistItems: [...demoChecklistItems],
  participantes: [...demoParticipantes],
  proveedores: [...demoProveedores],
  facturas: [...demoFacturas],
  facturasGenerales: [...demoFacturasGenerales],
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
    if (DEMO_MODE) return [...store.plantillas]
    return apiFetch<PlantillaChecklist[]>("/api/plantillas")
  },
  async getPlantilla(id: string): Promise<PlantillaChecklist | null> {
    if (DEMO_MODE) return store.plantillas.find((p) => p.id === id) || null
    return apiFetch<PlantillaChecklist>(`/api/plantillas/${id}`).catch(() => null)
  },

  async generateChecklistFromTemplate(cursoId: string, plantillaId: string, asistentes: number) {
    if (DEMO_MODE) {
      const plantilla = store.plantillas.find((p) => p.id === plantillaId)
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
      return nuevo
    }
    return apiFetch<Inventario>("/api/inventario", { method: "POST", body: JSON.stringify(item) })
  },
  async updateInventarioItem(sku: string, updates: Partial<Inventario>): Promise<Inventario | null> {
    if (DEMO_MODE) {
      const idx = store.inventario.findIndex((i) => i.sku === sku)
      if (idx === -1) return null
      store.inventario[idx] = { ...store.inventario[idx], ...updates, updatedAtISO: new Date().toISOString() }
      return store.inventario[idx]
    }
    return apiFetch<Inventario>(`/api/inventario/${sku}`, { method: "PUT", body: JSON.stringify(updates) }).catch(() => null)
  },
  async deleteInventarioItem(sku: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.inventario = store.inventario.filter((i) => i.sku !== sku)
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
      return nueva
    }
    return apiFetch<Factura>("/api/facturas", { method: "POST", body: JSON.stringify(factura) })
  },
  async deleteFactura(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.facturas = store.facturas.filter((f) => f.id !== id)
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
      return nueva
    }
    return apiFetch<FacturaGeneral>("/api/facturas", { method: "POST", body: JSON.stringify(factura) })
  },
  async deleteFacturaGeneral(id: string): Promise<boolean> {
    if (DEMO_MODE) {
      store.facturasGenerales = store.facturasGenerales.filter((f) => f.id !== id)
      return true
    }
    await apiFetch(`/api/facturas-generales/${id}`, { method: "DELETE" })
    return true
  },
}
