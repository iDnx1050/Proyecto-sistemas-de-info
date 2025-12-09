"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const movimientos = await prisma.movimiento.findMany({
    orderBy: { fechaISO: "desc" },
  })
  return NextResponse.json(
    movimientos.map((m) => ({ ...m, fechaISO: m.fechaISO.toISOString() })),
  )
}
