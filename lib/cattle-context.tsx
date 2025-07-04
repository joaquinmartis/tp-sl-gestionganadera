"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

export interface Cattle {
  id: string
  name: string
  description: string
  imageUrl: string
  location: {
    type: "Point"
    coordinates: [number, number] // [lng, lat]
  }
  connected: boolean
  zoneId: string | null
}

export interface Zone {
  id: string
  name: string
  description: string
  bounds: [[number, number], [number, number]] // [[lat1, lng1], [lat2, lng2]]
  color: string
  geometry: {
    type: "Polygon"
    coordinates: [[[number, number]]] // [[[lng, lat], ...]]
  }
}

interface CattleContextType {
  cattle: Cattle[]
  zones: Zone[]
  loading: boolean
  connectedCattle: number
  selectedCattleId: string | null
  setSelectedCattleId: (id: string | null) => void
  selectedZoneId: string | null
  setSelectedZoneId: (id: string | null) => void
  setCattle: (cattle: Cattle[]) => void
  cattleCounts: Record<string, number>
  setCattleCounts: (counts: Record<string, number>) => void
}

const CattleContext = createContext<CattleContextType | undefined>(undefined)

export function CattleProvider({ children }: { children: ReactNode }) {
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCattleId, setSelectedCattleId] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [cattleCounts, setCattleCounts] = useState<Record<string, number>>({})

  const fetchCattleCounts = async () => {
    try {
      const res = await fetch("/api/zones/counts")
      const data = await res.json()
      if (data.success) {
        setCattleCounts(data.data)
      } else {
        console.error("Error al obtener los counts:", data.error)
      }
    } catch (err) {
      console.error("Error al consultar counts:", err)
    }
  }

  // Inicializar datos solo si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchData = async () => {
      try {
        const resZones = await fetch("/api/zones")
        const dataZones = await resZones.json()
        if (dataZones.success) {
          setZones(dataZones.data)
        } else {
          console.error("Error al obtener las zonas:", dataZones.error)
        }

        const resCattle = await fetch("/api/cattle")
        const dataCattle = await resCattle.json()
        if (dataCattle.success) {
          setCattle(dataCattle.data)
        } else {
          console.error("Error al obtener el ganado:", dataCattle.error)
        }

        await fetchCattleCounts()

        const audio = new Audio("/moo.mp3")
        audio.play().catch((e) => console.log("Error reproduciendo audio:", e))
      } catch (error) {
        console.error("Error general en la carga de datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  // Simular movimiento de vacas
  useEffect(() => {
    if (loading || !isAuthenticated || zones.length === 0) return

    const movementInterval = setInterval(() => {
      setCattle((prevCattle) => {
        return prevCattle.map((cow) => {
          if (!cow.connected) return cow

          const farmZone = zones[0]
          const [[minLat, minLng], [maxLat, maxLng]] = farmZone.bounds

          const latChange = (Math.random() - 0.5) * 0.001
          const lngChange = (Math.random() - 0.5) * 0.001

          let newLat = cow.location.coordinates[0] + latChange
          let newLng = cow.location.coordinates[1] + lngChange

          const wouldBeOutside = newLat < minLat || newLat > maxLat || newLng < minLng || newLng > maxLng

          if (wouldBeOutside && Math.random() > 0.005) {
            newLat = Math.max(minLat, Math.min(maxLat, newLat))
            newLng = Math.max(minLng, Math.min(maxLng, newLng))
          }

          const newPosition: [number, number] = [newLat, newLng]
          let newZoneId: string | null = null

          for (const zone of zones) {
            const [[zMinLat, zMinLng], [zMaxLat, zMaxLng]] = zone.bounds
            if (
              newPosition[0] >= zMinLat &&
              newPosition[0] <= zMaxLat &&
              newPosition[1] >= zMinLng &&
              newPosition[1] <= zMaxLng
            ) {
              newZoneId = zone.id
              break
            }
          }

          const isOutside =
            newPosition[0] < minLat || newPosition[0] > maxLat || newPosition[1] < minLng || newPosition[1] > maxLng

          if (isOutside) {
            const audio = new Audio("/alert.mp3")
            audio.play().catch((e) => console.log("Error reproduciendo alerta:", e))
            setTimeout(() => {
              toast({
                title: "¡Alerta de seguridad!",
                description: `${cow.name} se tomó el palo de la granja`,
                variant: "destructive",
              })
            }, 0)

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("¡Alerta de seguridad!", {
                body: `${cow.name} se tomó el palo de la granja`,
                icon: "/cow-icon.png",
              })
            }
          }

          const updatedCow = {
            ...cow,
            location: {
              ...cow.location,
              coordinates: [newLat, newLng] as [number, number],
            },
            zoneId: newZoneId,
          }

          void fetch("/api/cattle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: updatedCow.id,
              name: updatedCow.name,
              description: updatedCow.description,
              imageUrl: updatedCow.imageUrl,
              position: updatedCow.location.coordinates,
              connected: updatedCow.connected,
              zoneId: updatedCow.zoneId,
            }),
          }).then(() => {
            fetchCattleCounts() // ✅ actualizar después del POST
          })

          return updatedCow
        })
      })
    }, 2000)

    return () => clearInterval(movementInterval)
  }, [loading, zones, toast, isAuthenticated])

  // Simular desconexiones
  useEffect(() => {
    if (loading || !isAuthenticated) return

    const disconnectionInterval = setInterval(() => {
      setCattle((prevCattle) => {
        const updated = prevCattle.map((cow) => {
          if (cow.connected && Math.random() < 0.05) {
            toast({
              title: "Desconexión detectada",
              description: `${cow.name} se ha desconectado del sistema.`,
              variant: "destructive",
            })
            setTimeout(() => {
              setCattle((current) =>
                current.map((c) =>
                  c.id === cow.id ? { ...c, connected: true } : c
                )
              )
              toast({
                title: "Re-conexión exitosa",
                description: `${cow.name} volvió a conectarse.`,
                variant: "default",
              })
            }, 15000)

            return { ...cow, connected: false }
          }
          return cow
        })

        return updated
      })
    }, 60000)

    return () => clearInterval(disconnectionInterval)
  }, [loading, isAuthenticated, toast])

  const connectedCattle = cattle.filter((cow) => cow.connected).length

  return (
    <CattleContext.Provider
      value={{
        cattle,
        zones,
        loading,
        connectedCattle,
        selectedCattleId,
        setSelectedCattleId,
        selectedZoneId,
        setSelectedZoneId,
        setCattle,
        cattleCounts,
        setCattleCounts,
      }}
    >
      {children}
    </CattleContext.Provider>
  )
}

export function useCattle() {
  const context = useContext(CattleContext)
  if (context === undefined) {
    throw new Error("useCattle must be used within a CattleProvider")
  }
  return context
}
