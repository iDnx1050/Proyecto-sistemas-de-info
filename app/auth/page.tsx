"use client"

import Image from "next/image"
import { ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const router = useRouter()

  const handleLogin = () => {
    router.push("/app/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b2e1f] via-[#0f3f2a] to-[#082115] flex items-center justify-center p-6">
      <Card className="w-full max-w-5xl mx-auto overflow-hidden shadow-2xl border-0 bg-[#0d3022]">
        <div className="grid md:grid-cols-[420px,1fr]">
          {/* Izquierda */}
          <div className="relative px-8 py-10 bg-[#0a251a] text-white space-y-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition"
              onClick={() => router.push("/auth")}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Image src="/otek.ico" alt="Sistema de Gestión OTEK" width={28} height={28} priority />
                </div>
                <div>
                  <p className="text-sm text-white/60">Sistema de Gestión OTEK</p>
                  <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
                </div>
              </div>
              <p className="text-sm text-white/70">Ingresa tus credenciales o continúa para explorar el panel.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80" htmlFor="user">
                  Usuario
                </Label>
                <Input id="user" placeholder="admin@ong.cl" className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80" htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-white/70">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="rounded border-white/30 bg-white/5" />
                  Recordarme
                </label>
                <button type="button" className="underline hover:text-white" onClick={handleLogin}>
                  Continuar demo
                </button>
              </div>

              <Button onClick={handleLogin} className="w-full bg-[#2f9e44] hover:bg-[#25823a]">
                Iniciar sesión
              </Button>
            </div>
          </div>

          {/* Derecha visual con logo */}
          <div
            className="relative min-h-[520px] flex items-center justify-center p-6"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(47,158,68,0.35), transparent 30%), radial-gradient(circle at 80% 30%, rgba(74,223,134,0.3), transparent 30%), radial-gradient(circle at 50% 70%, rgba(0,176,116,0.25), transparent 35%)",
              backgroundColor: "#0d3022",
            }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 400 200%22 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath d=%27M0 100 C 50 120, 150 80, 200 100 C 250 120, 350 80, 400 100 L 400 200 L 0 200 Z%27 fill=%27%23202a50%27/%3E%3C/svg%3E')] bg-cover bg-center opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40" />
            <div className="relative w-full max-w-3xl flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo OTEK"
                width={900}
                height={600}
                className="w-full h-auto max-h-[520px] object-contain"
                priority
              />
            </div>
            <div className="absolute inset-0 flex items-end justify-end p-6 text-white/40">
              <Shield className="w-10 h-10" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
