"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const curso = await prisma.curso.findUnique({ where: { id: params.id } })
  if (!curso) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { createdAt, fechaISO, ...rest } = curso
  return NextResponse.json({
    ...rest,
    fechaISO: fechaISO.toISOString(),
    createdAtISO: createdAt.toISOString(),
  })
}

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json()
  const updated = await prisma.curso.update({
    where: { id: params.id },
    data: {
      nombre: body.nombre,
      tipo: body.tipo,
      fechaISO: body.fechaISO ? new Date(body.fechaISO) : undefined,
      lugar: body.lugar,
      asistentes: body.asistentes,
      responsable: body.responsable,
      activo: body.activo,
      plantillaChecklistId: body.plantillaChecklistId,
    },
  })
  const { createdAt, fechaISO, ...rest } = updated
  return NextResponse.json({
    ...rest,
    fechaISO: fechaISO.toISOString(),
    createdAtISO: createdAt.toISOString(),
  })
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.curso.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
