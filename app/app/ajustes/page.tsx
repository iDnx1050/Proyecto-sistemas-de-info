"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { es } from "@/lib/i18n/es"

export default function AjustesPage() {
  const [rolePermissions, setRolePermissions] = useState({
    admin: { create: true, edit: true, delete: true, view: true },
    instructor: { create: false, edit: true, delete: false, view: true },
    lectura: { create: false, edit: false, delete: false, view: true },
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{es.ajustes.title}</h1>
        <p className="text-muted-foreground mt-1">Gestiona configuraciones y roles del sistema</p>
      </div>

      {/* Role Management */}
      <Card>
        <CardHeader>
          <CardTitle>{es.ajustes.roles}</CardTitle>
          <CardDescription>Configura los permisos por rol (solo interfaz de demostración)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Admin Role */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{es.roles.admin}</h3>
                <p className="text-sm text-muted-foreground">Acceso completo al sistema</p>
              </div>
              <Badge>Todos los permisos</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-4 pl-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-view">Ver</Label>
                <Switch id="admin-view" checked={rolePermissions.admin.view} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-create">Crear</Label>
                <Switch id="admin-create" checked={rolePermissions.admin.create} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-edit">Editar</Label>
                <Switch id="admin-edit" checked={rolePermissions.admin.edit} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-delete">Eliminar</Label>
                <Switch id="admin-delete" checked={rolePermissions.admin.delete} disabled />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{es.roles.instructor}</h3>
                <p className="text-sm text-muted-foreground">Gestiona cursos asignados y checklists</p>
              </div>
              <Badge variant="secondary">Permisos limitados</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-4 pl-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="instructor-view">Ver</Label>
                <Switch id="instructor-view" checked={rolePermissions.instructor.view} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="instructor-create">Crear</Label>
                <Switch id="instructor-create" checked={rolePermissions.instructor.create} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="instructor-edit">Editar</Label>
                <Switch id="instructor-edit" checked={rolePermissions.instructor.edit} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="instructor-delete">Eliminar</Label>
                <Switch id="instructor-delete" checked={rolePermissions.instructor.delete} disabled />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{es.roles.lectura}</h3>
                <p className="text-sm text-muted-foreground">Solo visualización de datos</p>
              </div>
              <Badge variant="outline">Solo lectura</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-4 pl-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="lectura-view">Ver</Label>
                <Switch id="lectura-view" checked={rolePermissions.lectura.view} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lectura-create">Crear</Label>
                <Switch id="lectura-create" checked={rolePermissions.lectura.create} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lectura-edit">Editar</Label>
                <Switch id="lectura-edit" checked={rolePermissions.lectura.edit} disabled />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lectura-delete">Eliminar</Label>
                <Switch id="lectura-delete" checked={rolePermissions.lectura.delete} disabled />
              </div>
            </div>
          </div>

          <div className="pt-4 p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Esta es una interfaz de demostración. En producción, los permisos se gestionarían
              desde el backend con Firebase Authentication y Firestore Security Rules.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Firebase Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Integración con SQLite</CardTitle>
          <CardDescription>Información para conectar con backend real usando SQLite/Prisma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <p className="text-sm font-medium">Tablas sugeridas:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <code className="text-xs bg-background px-1 py-0.5 rounded">Curso</code> - Datos de cursos
              </li>
              <li>
                <code className="text-xs bg-background px-1 py-0.5 rounded">ChecklistItem</code> - Items de checklists
              </li>
              <li>
                <code className="text-xs bg-background px-1 py-0.5 rounded">Inventario</code> - Stock de materiales
              </li>
              <li>
                <code className="text-xs bg-background px-1 py-0.5 rounded">Movimiento</code> - Historial de movimientos
              </li>
              <li>
                <code className="text-xs bg-background px-1 py-0.5 rounded">Participante</code> - Datos de participantes
              </li>
              <li>
                <code className="text-xs bg-background px-1 py-0.5 rounded">Proveedor</code> - Información de proveedores
              </li>
              <li>
                <code className="text-xs bg-background px-1 py-0.5 rounded">Factura</code> - Facturas y documentos
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-muted space-y-2">
            <p className="text-sm font-medium">Reemplazar mock API:</p>
            <p className="text-sm text-muted-foreground">
              Sustituir las funciones en <code className="text-xs bg-background px-1 py-0.5 rounded">lib/mock.ts</code>{" "}
              con llamadas a SQLite mediante Prisma usando{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">@prisma/client</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

