"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

type Params = { params: { id: string } }

export async function DELETE(_: Request, { params }: Params) {
  await prisma.participante.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
