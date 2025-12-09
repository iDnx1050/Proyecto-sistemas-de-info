"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

type Params = { params: { sku: string } }

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json()
  const updated = await prisma.inventario.update({
    where: { sku: params.sku },
    data: {
      nombre: body.nombre,
      talla: body.talla,
      color: body.color,
      stock: body.stock,
      stockMin: body.stockMin,
      ubicacion: body.ubicacion,
      updatedAt: new Date(),
    },
  })
  const { updatedAt, ...rest } = updated
  return NextResponse.json({ ...rest, updatedAtISO: updatedAt.toISOString() })
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.inventario.delete({ where: { sku: params.sku } })
  return NextResponse.json({ ok: true })
}
