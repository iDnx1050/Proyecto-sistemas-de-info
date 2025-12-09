"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@/lib/types"

export type UserProfile = {
  name: string
  email: string
  role: UserRole
  level: string
  title?: string
  phone?: string
  location?: string
  bio?: string
  avatar?: string
}

type UserContextValue = {
  user: UserProfile
  updateUserProfile: (updates: Partial<UserProfile>) => void
  logout: () => void
}

const defaultUser: UserProfile = {
  name: "Usuario Demo",
  email: "admin@ong.cl",
  role: "admin",
  level: "Administrador",
  title: "Coordinador logístico",
  phone: "+56 9 9876 5432",
  location: "Santiago, CL",
  bio: "Responsable de la operación logística y la coordinación de cursos.",
}

const STORAGE_KEY = "demo-user-profile"

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile>(defaultUser)

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile
        setUser(parsed)
      } catch (error) {
        console.error("No se pudo leer el usuario guardado", error)
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updates }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      }
      return next
    })
  }

  const logout = () => {
    setUser(defaultUser)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    router.push("/auth")
  }

  const value = useMemo(() => ({ user, updateUserProfile, logout }), [user])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error("useUser debe usarse dentro de UserProvider")
  }
  return ctx
}
