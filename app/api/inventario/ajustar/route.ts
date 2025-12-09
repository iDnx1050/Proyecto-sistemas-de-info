"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function POST(request: Request) {
  const body = await request.json()
  const { sku, cantidad, tipo, referencia, usuario } = body

  const item = await prisma.inventario.findUnique({ where: { sku } })
  if (!item) return NextResponse.json({ error: "Item no encontrado" }, { status: 404 })

  const nuevoStock = tipo === "entrada" ? item.stock + cantidad : item.stock - cantidad
  if (nuevoStock < 0) return NextResponse.json({ error: "Stock insuficiente" }, { status: 400 })

  const movimiento = await prisma.$transaction(async (tx) => {
    await tx.inventario.update({
      where: { sku },
      data: { stock: nuevoStock, updatedAt: new Date() },
    })

    return tx.movimiento.create({
      data: {
        sku,
        cantidad,
        tipo,
        referencia,
        usuario: usuario || "system@ong.cl",
        fechaISO: new Date(),
      },
    })
  })

  return NextResponse.json({ ok: true, movimiento: { ...movimiento, fechaISO: movimiento.fechaISO.toISOString() } })
}
