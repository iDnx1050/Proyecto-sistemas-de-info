"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursoId = searchParams.get("cursoId") || undefined
  const items = await prisma.checklistItem.findMany({
    where: cursoId ? { cursoId } : undefined,
    orderBy: { id: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await prisma.checklistItem.create({
    data: {
      cursoId: body.cursoId,
      sku: body.sku,
      item: body.item,
      unidad: body.unidad,
      qtyPlanificada: body.qtyPlanificada,
      cantidadPorPersona: body.cantidadPorPersona,
      origen: body.origen,
      estado: body.estado ?? "pendiente",
      notas: body.notas,
    },
  })
  return NextResponse.json(item)
}
