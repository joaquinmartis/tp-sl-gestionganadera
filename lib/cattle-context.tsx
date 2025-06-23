"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

export interface Cattle {
  id: string
  name: string
  description: string
  imageUrl: string
  position: {
    type: "Point"
    coordinates: [number, number]
  }
  connected: boolean
  zoneId: string | null
}

export interface Zone {
  id: string
  name: string
  description: string
  bounds: {
    type: "Polygon"
    coordinates: [
      [
        [number, number],
        [number, number],
        [number, number],
        [number, number],
        [number, number]
      ]
    ]
  }
  color: string
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
  getCattleByZone: (zoneId: string | null) => Promise<Cattle[]>
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

  // Función para obtener ganado filtrado por zona usando GeoSearch
  const getCattleByZone = async (zoneId: string | null) => {
    if (!zoneId) {
      // Si no hay zona seleccionada, obtener todas las vacas
      const res = await fetch("/api/cattle")
      const data = await res.json()
      return data.success ? data.data : []
    }

    // Obtener vacas de la zona específica usando GeoSearch
    const res = await fetch(`/api/cattle?zoneId=${zoneId}`)
    const data = await res.json()
    return data.success ? data.data : []
  }

  // Inicializar datos solo si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      // No inicializar datos si no hay usuario autenticado
      return
    }

  const fetchData = async () => {
    try {
      const resZones = await fetch("/api/zones")
      const dataZones = await resZones.json()
      if (dataZones.success) {
        setZones(dataZones.data)
      } else {
        console.error("Error al obtener las zonas:", dataZones.error)
      }

      // 2. Obtener ganado desde la API
      const resCattle = await fetch("/api/cattle")
      const dataCattle = await resCattle.json()

      if (dataCattle.success) {
        setCattle(dataCattle.data)
      } else {
        console.error("Error al obtener el ganado:", dataCattle.error)
      }
      // 3. Reproducir sonido de bienvenida
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

  // Actualizar ganado cuando cambie la zona seleccionada
  useEffect(() => {
    if (!isAuthenticated || loading) return

    const updateCattleByZone = async () => {
      const zoneCattle = await getCattleByZone(selectedZoneId)
      setCattle(zoneCattle)
    }

    updateCattleByZone()
  }, [selectedZoneId, isAuthenticated, loading])

  // Simular movimiento de vacas solo si el usuario está autenticado
  useEffect(() => {
    if (loading || !isAuthenticated || zones.length === 0) return

    const movementInterval = setInterval(() => {
      setCattle((prevCattle) => {
        return prevCattle.map((cow) => {
          // Solo mover vacas conectadas
          if (!cow.connected) return cow

          // Obtener los límites de la granja (primera zona)
          const farmZone = zones[0]
          const coordinates = farmZone.bounds.coordinates[0]
          const lngs = coordinates.map(coord => coord[0])
          const lats = coordinates.map(coord => coord[1])

          const minLng = Math.min(...lngs)
          const maxLng = Math.max(...lngs)
          const minLat = Math.min(...lats)
          const maxLat = Math.max(...lats)
          // Movimiento aleatorio pequeño
          const latChange = (Math.random() - 0.5) * 0.001
          const lngChange = (Math.random() - 0.5) * 0.001

          // Calcular nueva posición
          const currentLng = cow.position.coordinates[0]
          const currentLat = cow.position.coordinates[1]

          let newLng = currentLng + lngChange
          let newLat = currentLat + latChange

          // Verificar si la nueva posición estaría fuera de la granja
          const wouldBeOutside = newLat < minLat || newLat > maxLat || newLng < minLng || newLng > maxLng

          // Si estaría fuera, hay una pequeña probabilidad (0.5%) de permitirlo para simular escape
          // De lo contrario, ajustamos la posición para mantenerla dentro de los límites
          if (wouldBeOutside && Math.random() > 0.005) {
            // Ajustar la posición para mantenerla dentro de los límites
            newLat = Math.max(minLat, Math.min(maxLat, newLat))
            newLng = Math.max(minLng, Math.min(maxLng, newLng))
          }

          const newPosition: [number, number] = [newLng,newLat]

          // Determinar en qué zona está
          let newZoneId: string | null = null

          for (const zone of zones) {
            const coordinates = zone.bounds.coordinates[0]
            const zoneLngs = coordinates.map(coord => coord[0])
            const zoneLats = coordinates.map(coord => coord[1])

            const zMinLng = Math.min(...zoneLngs)
            const zMaxLng = Math.max(...zoneLngs)
            const zMinLat = Math.min(...zoneLats)
            const zMaxLat = Math.max(...zoneLats)
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

          // Verificar si salió de la zona general (primera zona)
          const isOutside =
            newPosition[1] < minLat || newPosition[1] > maxLat || newPosition[0] < minLng || newPosition[0] > maxLng

          if (isOutside) {
            // Alerta: vaca fuera de la granja
            const audio = new Audio("/alert.mp3")
            audio.play().catch((e) => console.log("Error reproduciendo alerta:", e))

            // Usamos setTimeout para evitar actualizar el estado durante el renderizado
            setTimeout(() => {
              toast({
                title: "¡Alerta de seguridad!",
                description: `${cow.name} se tomó el palo de la granja`,
                variant: "destructive",
              })
            }, 0)

            // Enviar notificación push si está permitido
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("¡Alerta de seguridad!", {
                body: `${cow.name} se tomó el palo de la granja`,
                icon: "/cow-icon.png",
              })
            }
          }

          return {
            ...cow,
            position: {
              type: "Point",
              coordinates: newPosition,
            },
            zoneId: newZoneId,
          }
        })
      })
    }, 2000)

    return () => clearInterval(movementInterval)
  }, [loading, zones, toast, isAuthenticated])

  // Simular desconexiones aleatorias solo si el usuario está autenticado
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
          // Reprogramar reconexión en 10 segundos
          setTimeout(() => {
            setCattle((current) =>
              current.map((c) =>
                c.id === cow.id ? { ...c, connected: true } : c
              )
            )
            // Mostrar toast de reconexión
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
  }, 60000) // cada 30 segundos

  return () => clearInterval(disconnectionInterval)
}, [loading, isAuthenticated, toast])


  // Calcular cantidad de vacas conectadas
  const connectedCattle = cattle.filter((cow) => cow.connected).length

  console.log("Zonas recibidas:", zones);

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
        getCattleByZone,
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
