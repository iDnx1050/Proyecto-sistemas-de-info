import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppTopbar } from "@/components/app-topbar"
import { UserProvider } from "@/components/user-provider"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppTopbar />
          <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
        </div>
      </div>
    </UserProvider>
  )
}

