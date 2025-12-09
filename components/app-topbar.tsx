"use client"

import { useEffect, useState } from "react"
import { Menu, User } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { es } from "@/lib/i18n/es"
import type { UserRole } from "@/lib/types"
import { useUser } from "@/components/user-provider"

export function AppTopbar() {
  const { user, updateUserProfile, logout } = useUser()
  const router = useRouter()
  const [currentRole, setCurrentRole] = useState<UserRole>(user.role)
  const [santiagoTime, setSantiagoTime] = useState(
    new Date().toLocaleTimeString("es-CL", {
      timeZone: "America/Santiago",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  )

  useEffect(() => {
    setCurrentRole(user.role)
  }, [user.role])

  useEffect(() => {
    const timer = setInterval(() => {
      setSantiagoTime(
        new Date().toLocaleTimeString("es-CL", {
          timeZone: "America/Santiago",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role)
    updateUserProfile({ role, level: es.roles[role] || role })
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Image src="/otek.ico" alt="Sistema de Gestion OTEK" width={32} height={32} priority />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold leading-tight">Sistema de Gestion OTEK</h1>
            <p className="text-xs text-muted-foreground">Sistema Integrado</p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Santiago</span>
          <span className="tabular-nums">{santiagoTime}</span>
        </div>

        {/* Role selector (demo) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Badge variant="secondary" className="capitalize">
                {es.roles[currentRole]}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Cambiar rol (demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRoleChange("admin")}>{es.roles.admin}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("instructor")}>{es.roles.instructor}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRoleChange("lectura")}>{es.roles.lectura}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback>{initials || <User className="w-4 h-4" />}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="space-y-1">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="capitalize">
                {es.roles[user.role] || user.level}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/app/perfil")}>Perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
