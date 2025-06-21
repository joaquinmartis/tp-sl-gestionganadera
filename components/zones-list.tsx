"use client"

import { useCattle } from "@/lib/cattle-context"

interface ZonesListProps {
  onItemClick?: () => void
}

export default function ZonesList({ onItemClick }: ZonesListProps) {
  const { zones, cattle, selectedZoneId, setSelectedZoneId } = useCattle()

  // Contar vacas por zona (usando los datos actuales filtrados)
  const cattleCountByZone = zones.reduce(
    (acc, zone) => {
      if (selectedZoneId === zone.id) {
        // Si esta zona está seleccionada, mostrar el conteo de las vacas filtradas
        acc[zone.id] = cattle.length
      } else {
        // Para zonas no seleccionadas, mostrar 0 o hacer una consulta separada
        acc[zone.id] = 0
      }
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-1">
      {zones.map((zone) => (
        <button
          key={zone.id}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
            selectedZoneId === zone.id ? "bg-green-100 text-green-900" : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => {
            setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id)
            onItemClick?.()
          }}
        >
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: zone.color }} />
            <span className="truncate">{zone.name}</span>
          </div>
          <span className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5">
            {selectedZoneId === zone.id ? cattle.length : "..."}
          </span>
        </button>
      ))}
    </div>
  )
}
