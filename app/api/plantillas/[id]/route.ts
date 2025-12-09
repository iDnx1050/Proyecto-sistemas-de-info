"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const plantilla = await prisma.plantillaChecklist.findUnique({ where: { id: params.id } })
  if (!plantilla) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(plantilla)
}
