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

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    return apiFetch<Curso[]>("/api/cursos")
  },
  async getCurso(id: string): Promise<Curso | null> {
    return apiFetch<Curso>(`/api/cursos/${id}`).catch(() => null)
  },
  async createCurso(curso: Omit<Curso, "id" | "createdAtISO">): Promise<Curso> {
    return apiFetch<Curso>("/api/cursos", { method: "POST", body: JSON.stringify(curso) })
  },
  async updateCurso(id: string, updates: Partial<Curso>): Promise<Curso | null> {
    return apiFetch<Curso>(`/api/cursos/${id}`, { method: "PUT", body: JSON.stringify(updates) }).catch(() => null)
  },
  async deleteCurso(id: string): Promise<boolean> {
    await apiFetch(`/api/cursos/${id}`, { method: "DELETE" })
    return true
  },

  // Plantillas
  async getPlantillas(): Promise<PlantillaChecklist[]> {
    return apiFetch<PlantillaChecklist[]>("/api/plantillas")
  },
  async getPlantilla(id: string): Promise<PlantillaChecklist | null> {
    return apiFetch<PlantillaChecklist>(`/api/plantillas/${id}`).catch(() => null)
  },

  async generateChecklistFromTemplate(cursoId: string, plantillaId: string, asistentes: number) {
    return apiFetch<ChecklistItem[]>("/api/checklist-items/generate", {
      method: "POST",
      body: JSON.stringify({ cursoId, plantillaId, asistentes }),
    })
  },

  // Checklist
  async getChecklistItems(cursoId?: string): Promise<ChecklistItem[]> {
    const query = cursoId ? `?cursoId=${cursoId}` : ""
    return apiFetch<ChecklistItem[]>(`/api/checklist-items${query}`)
  },
  async createChecklistItem(item: Omit<ChecklistItem, "id">): Promise<ChecklistItem> {
    return apiFetch<ChecklistItem>("/api/checklist-items", { method: "POST", body: JSON.stringify(item) })
  },
  async updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem | null> {
    return apiFetch<ChecklistItem>(`/api/checklist-items/${id}`, { method: "PUT", body: JSON.stringify(updates) }).catch(
      () => null,
    )
  },
  async deleteChecklistItem(id: string): Promise<boolean> {
    await apiFetch(`/api/checklist-items/${id}`, { method: "DELETE" })
    return true
  },

  // Inventario
  async getInventario(): Promise<Inventario[]> {
    return apiFetch<Inventario[]>("/api/inventario")
  },
  async createInventarioItem(item: Omit<Inventario, "updatedAtISO">): Promise<Inventario> {
    return apiFetch<Inventario>("/api/inventario", { method: "POST", body: JSON.stringify(item) })
  },
  async updateInventarioItem(sku: string, updates: Partial<Inventario>): Promise<Inventario | null> {
    return apiFetch<Inventario>(`/api/inventario/${sku}`, { method: "PUT", body: JSON.stringify(updates) }).catch(() => null)
  },
  async deleteInventarioItem(sku: string): Promise<boolean> {
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
    return apiFetch("/api/inventario/ajustar", {
      method: "POST",
      body: JSON.stringify({ sku, cantidad, tipo, referencia, usuario }),
    })
  },

  async getMovimientos(): Promise<Movimiento[]> {
    return apiFetch<Movimiento[]>("/api/movimientos")
  },

  // Participantes
  async getParticipantes(cursoId?: string): Promise<Participante[]> {
    const query = cursoId ? `?cursoId=${cursoId}` : ""
    return apiFetch<Participante[]>(`/api/participantes${query}`)
  },
  async createParticipante(participante: Omit<Participante, "id">): Promise<Participante> {
    return apiFetch<Participante>("/api/participantes", { method: "POST", body: JSON.stringify(participante) })
  },
  async deleteParticipante(id: string): Promise<boolean> {
    await apiFetch(`/api/participantes/${id}`, { method: "DELETE" })
    return true
  },

  // Proveedores
  async getProveedores(): Promise<Proveedor[]> {
    return apiFetch<Proveedor[]>("/api/proveedores")
  },
  async createProveedor(proveedor: Omit<Proveedor, "id">): Promise<Proveedor> {
    return apiFetch<Proveedor>("/api/proveedores", { method: "POST", body: JSON.stringify(proveedor) })
  },
  async updateProveedor(id: string, updates: Partial<Proveedor>): Promise<Proveedor | null> {
    return apiFetch<Proveedor>(`/api/proveedores/${id}`, { method: "PUT", body: JSON.stringify(updates) }).catch(() => null)
  },
  async deleteProveedor(id: string): Promise<boolean> {
    await apiFetch(`/api/proveedores/${id}`, { method: "DELETE" })
    return true
  },

  // Facturas
  async getFacturas(cursoId?: string): Promise<Factura[]> {
    const query = cursoId ? `?cursoId=${cursoId}` : ""
    return apiFetch<Factura[]>(`/api/facturas${query}`)
  },
  async createFactura(factura: Omit<Factura, "id" | "createdAtISO">): Promise<Factura> {
    return apiFetch<Factura>("/api/facturas", { method: "POST", body: JSON.stringify(factura) })
  },
  async deleteFactura(id: string): Promise<boolean> {
    await apiFetch(`/api/facturas/${id}`, { method: "DELETE" })
    return true
  },

  // Facturas Generales (alias al mismo origen)
  async getFacturasGenerales(): Promise<FacturaGeneral[]> {
    return apiFetch<FacturaGeneral[]>("/api/facturas-generales")
  },
  async createFacturaGeneral(factura: Omit<FacturaGeneral, "id" | "createdAtISO">): Promise<FacturaGeneral> {
    return apiFetch<FacturaGeneral>("/api/facturas", { method: "POST", body: JSON.stringify(factura) })
  },
  async deleteFacturaGeneral(id: string): Promise<boolean> {
    await apiFetch(`/api/facturas-generales/${id}`, { method: "DELETE" })
    return true
  },
}
