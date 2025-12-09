"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Camera, ShieldCheck, UserCheck } from "lucide-react"
import { useUser } from "@/components/user-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { es } from "@/lib/i18n/es"

export default function PerfilPage() {
  const { user, updateUserProfile } = useUser()
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
  })
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined)

  useEffect(() => {
    setForm({
      name: user.name,
      email: user.email,
      title: user.title || "",
    })
    setAvatarPreview(user.avatar)
  }, [user])

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatarPreview(result)
      updateUserProfile({ avatar: result })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updateUserProfile({
      ...form,
    })
  }

  const initials = form.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
          <p className="text-muted-foreground mt-1">Actualiza tu información básica y tu foto de perfil.</p>
        </div>
        <Badge variant="secondary" className="gap-1 text-sm">
          <ShieldCheck className="w-4 h-4" />
          {es.roles[user.role]} • Nivel: {user.level}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Foto y nivel</CardTitle>
            <CardDescription>Sube una imagen para personalizar tu avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-28 h-28">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt={form.name} />
                ) : (
                  <AvatarFallback className="text-xl">{initials || "U"}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="capitalize">
                  {es.roles[user.role]}
                </Badge>
                <Badge variant="outline">{user.level}</Badge>
              </div>
              <label className="w-full">
                <span className="sr-only">Subir imagen</span>
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-muted-foreground/40 px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition">
                  <Camera className="w-4 h-4" />
                  Subir imagen de perfil
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">Usuario</p>
              <p className="text-sm text-muted-foreground">{form.email || "Sin correo"}</p>
              <p className="text-sm text-muted-foreground capitalize">Rol: {es.roles[user.role]}</p>
              <p className="text-sm text-muted-foreground">Nivel: {user.level}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
            <CardDescription>Datos para mostrar tu perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" value={form.name} onChange={handleChange("name")} placeholder="Usuario Demo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" value={form.email} onChange={handleChange("email")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Cargo</Label>
              <Input id="title" value={form.title} onChange={handleChange("title")} placeholder="Coordinador logístico" />
            </div>

            <div className="flex items-center justify-end">
              <Button className="gap-2" onClick={handleSave}>
                <UserCheck className="w-4 h-4" />
                Guardar cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
