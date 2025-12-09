"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GraduationCap,
  Package,
  ArrowLeftRight,
  Users,
  Building2,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { es } from "@/lib/i18n/es"

const navigation = [
  { name: es.nav.dashboard, href: "/app/dashboard", icon: LayoutDashboard },
  { name: es.nav.cursos, href: "/app/cursos", icon: GraduationCap },
  { name: es.nav.inventario, href: "/app/inventario", icon: Package },
  { name: es.nav.movimientos, href: "/app/movimientos", icon: ArrowLeftRight },
  { name: es.nav.participantes, href: "/app/participantes", icon: Users },
  { name: es.nav.proveedores, href: "/app/proveedores", icon: Building2 },
  { name: es.nav.reportes, href: "/app/reportes", icon: BarChart3 },
  { name: es.nav.ajustes, href: "/app/ajustes", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-64 border-r bg-card min-h-screen">
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

