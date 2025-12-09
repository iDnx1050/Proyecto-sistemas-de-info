"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

type Params = { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json()
  const updated = await prisma.checklistItem.update({
    where: { id: params.id },
    data: {
      estado: body.estado,
      notas: body.notas,
      qtyPlanificada: body.qtyPlanificada,
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.checklistItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
