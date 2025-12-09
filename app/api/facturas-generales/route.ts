"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const facturas = await prisma.factura.findMany({ orderBy: { createdAtISO: "desc" } })
  return NextResponse.json(
    facturas.map((f) => ({
      ...f,
      fechaEmisionISO: f.fechaEmisionISO.toISOString(),
      createdAtISO: f.createdAtISO.toISOString(),
    })),
  )
}
