"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursoId = searchParams.get("cursoId") || undefined
  const facturas = await prisma.factura.findMany({
    where: cursoId ? { cursoId } : undefined,
    orderBy: { createdAtISO: "desc" },
  })
  return NextResponse.json(
    facturas.map((f) => ({
      ...f,
      fechaEmisionISO: f.fechaEmisionISO.toISOString(),
      createdAtISO: f.createdAtISO.toISOString(),
    })),
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const factura = await prisma.factura.create({
    data: {
      cursoId: body.cursoId,
      proveedor: body.proveedor,
      montoCLP: body.montoCLP ?? 0,
      fechaEmisionISO: new Date(body.fechaEmisionISO),
      categoria: body.categoria ?? "otro",
      fileName: body.fileName,
      fileType: body.fileType,
      fileUrl: body.fileUrl,
      etiquetas: body.etiquetas,
    },
  })
  return NextResponse.json({
    ...factura,
    fechaEmisionISO: factura.fechaEmisionISO.toISOString(),
    createdAtISO: factura.createdAtISO.toISOString(),
  })
}
