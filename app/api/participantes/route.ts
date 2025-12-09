"use server"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cursoId = searchParams.get("cursoId") || undefined
  const participantes = await prisma.participante.findMany({
    where: cursoId ? { cursoId } : undefined,
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(participantes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const participante = await prisma.participante.create({
    data: {
      cursoId: body.cursoId,
      nombre: body.nombre,
      alergias: body.alergias,
      tallaPolera: body.tallaPolera,
      isVegan: body.isVegan,
    },
  })
  return NextResponse.json(participante)
}
