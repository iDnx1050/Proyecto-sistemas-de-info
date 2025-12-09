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

type AppSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

export function AppSidebar({ isOpen = false, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-sm transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0 lg:flex",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 lg:hidden border-b">
          <span className="font-semibold text-sm text-foreground">{es.nav.dashboard}</span>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
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
      </div>
    </aside>
  )
}

