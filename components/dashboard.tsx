"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useCattle } from "@/lib/cattle-context"
import CattleMap from "@/components/cattle-map"
import CattleList from "@/components/cattle-list"
import ZonesList from "@/components/zones-list"

interface DashboardProps {
  user: {
    name: string
    email: string
  }
}

export default function Dashboard({ user }: DashboardProps) {
  const { logout } = useAuth()
  const { toast } = useToast()
  const { cattle, zones, loading, connectedCattle } = useCattle()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCattleListCollapsed, setIsCattleListCollapsed] = useState(false)

  useEffect(() => {
    // Solicitar permiso para notificaciones
    if ("Notification" in window) {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para pantallas grandes */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-green-800">GanaTech</h1>
        </div>

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" disabled>
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/users">
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </Link>
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-semibold mb-2 text-gray-500">ZONAS</h2>
          <ZonesList />
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-semibold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-4 justify-between">
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4">
                    <h1 className="text-xl font-bold text-green-800">GanaTech</h1>
                  </div>

                  <Separator />

                  <div className="p-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start" disabled>
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/users" onClick={() => setIsMobileMenuOpen(false)}>
                        <Users className="mr-2 h-4 w-4" />
                        Usuarios
                      </Link>
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex-1 overflow-auto p-4">
                    <h2 className="text-sm font-semibold mb-2 text-gray-500">ZONAS</h2>
                    <ZonesList onItemClick={() => setIsMobileMenuOpen(false)} />
                  </div>

                  <div className="p-4 mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-green-800 ml-2">GanaTech</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notificaciones</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Panel izquierdo con lista de vacas (collapsible) */}
          <div
            className={`bg-white border-r overflow-y-auto transition-all duration-300 ${
              isCattleListCollapsed ? "md:w-0 w-0 opacity-0 invisible" : "md:w-80 w-full opacity-100 visible"
            }`}
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Ganado</h2>
              <CattleList />
            </div>
          </div>

          {/* Botón para colapsar/expandir la lista de vacas */}
          <button
            className="hidden md:flex items-center justify-center w-6 bg-white border-r border-l hover:bg-gray-100 transition-colors"
            onClick={() => setIsCattleListCollapsed(!isCattleListCollapsed)}
            aria-label={isCattleListCollapsed ? "Expandir lista" : "Colapsar lista"}
          >
            {isCattleListCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {/* Panel derecho con mapa y estadísticas */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Botón para mostrar/ocultar lista en móvil */}
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCattleListCollapsed(!isCattleListCollapsed)}
              >
                {isCattleListCollapsed ? "Mostrar lista de ganado" : "Ocultar lista de ganado"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cattle.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conectados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectedCattle}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Zonas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{zones.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden h-[calc(100%-7rem)]">
              <CardHeader className="pb-2">
                <CardTitle>Mapa de Ganado</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full w-full">
                  <CattleMap />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
