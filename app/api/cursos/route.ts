"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const cursos = await prisma.curso.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json(
    cursos.map(({ createdAt, fechaISO, ...rest }) => ({
      ...rest,
      fechaISO: fechaISO.toISOString(),
      createdAtISO: createdAt.toISOString(),
    })),
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const nuevo = await prisma.curso.create({
    data: {
      nombre: body.nombre,
      tipo: body.tipo,
      fechaISO: new Date(body.fechaISO),
      lugar: body.lugar,
      asistentes: body.asistentes,
      responsable: body.responsable,
      activo: body.activo ?? true,
      plantillaChecklistId: body.plantillaChecklistId,
    },
  })
  const { createdAt, fechaISO, ...rest } = nuevo
  return NextResponse.json({
    ...rest,
    fechaISO: fechaISO.toISOString(),
    createdAtISO: createdAt.toISOString(),
  })
}
