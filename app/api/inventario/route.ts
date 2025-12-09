"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const items = await prisma.inventario.findMany()
  return NextResponse.json(items.map(({ updatedAt, ...rest }) => ({ ...rest, updatedAtISO: updatedAt.toISOString() })))
}

export async function POST(request: Request) {
  const body = await request.json()
  const item = await prisma.inventario.create({
    data: {
      sku: body.sku,
      nombre: body.nombre,
      talla: body.talla,
      color: body.color,
      stock: body.stock ?? 0,
      stockMin: body.stockMin ?? 0,
      ubicacion: body.ubicacion,
    },
  })
  const { updatedAt, ...rest } = item
  return NextResponse.json({ ...rest, updatedAtISO: updatedAt.toISOString() })
}
