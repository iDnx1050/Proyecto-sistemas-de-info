"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function POST(request: Request) {
  const body = await request.json()
  const { cursoId, plantillaId, asistentes } = body
  const plantilla = await prisma.plantillaChecklist.findUnique({ where: { id: plantillaId } })
  if (!plantilla) {
    return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 })
  }
  const items = Array.isArray(plantilla.items) ? (plantilla.items as any[]) : []
  const created = await prisma.$transaction(
    items.map((templateItem: any) =>
      prisma.checklistItem.create({
        data: {
          cursoId,
          sku: templateItem.sku,
          item: templateItem.item,
          unidad: templateItem.unidad,
          qtyPlanificada: Math.ceil((templateItem.cantidadPorPersona || 0) * (asistentes || 0)),
          cantidadPorPersona: templateItem.cantidadPorPersona,
          origen: templateItem.sku ? "bodega" : "compra",
          estado: "pendiente",
        },
      }),
    ),
  )
  return NextResponse.json(created)
}
