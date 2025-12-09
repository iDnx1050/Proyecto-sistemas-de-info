"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const proveedores = await prisma.proveedor.findMany({ orderBy: { nombre: "asc" } })
  return NextResponse.json(proveedores)
}

export async function POST(request: Request) {
  const body = await request.json()
  const proveedor = await prisma.proveedor.create({
    data: {
      nombre: body.nombre,
      contacto: body.contacto,
      telefono: body.telefono,
      telefono2: body.telefono2,
      direccion: body.direccion,
      web: body.web,
    },
  })
  return NextResponse.json(proveedor)
}
