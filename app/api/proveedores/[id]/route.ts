"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

type Params = { params: { id: string } }

export async function PUT(request: Request, { params }: Params) {
  const body = await request.json()
  const proveedor = await prisma.proveedor.update({
    where: { id: params.id },
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

export async function DELETE(_: Request, { params }: Params) {
  await prisma.proveedor.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
