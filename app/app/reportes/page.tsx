import { ExpenseBySupplierTable } from "@/components/reportes/expense-by-supplier-table"
import { es } from "@/lib/i18n/es"

export default function ReportesPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{es.reportes.title}</h1>
        <p className="text-muted-foreground mt-1">Análisis detallado de gastos, stock y eficiencia operativa</p>
      </div>

      {/* Tables */}
      <ExpenseBySupplierTable />

      {/* Additional insights */}
    </div>
  )
}

