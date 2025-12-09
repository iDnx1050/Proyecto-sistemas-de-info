"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const plantillas = await prisma.plantillaChecklist.findMany()
  return NextResponse.json(
    plantillas.map((p) => ({
      ...p,
      items: p.items,
    })),
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const plantilla = await prisma.plantillaChecklist.create({
    data: {
      nombre: body.nombre,
      tipo: body.tipo,
      items: body.items ?? [],
    },
  })
  return NextResponse.json(plantilla)
}
