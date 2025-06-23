"use client"

import { useState, useEffect } from "react"
import { useCattle } from "@/lib/cattle-context"

interface ZonesListProps {
  onItemClick?: () => void
}

export default function ZonesList({ onItemClick }: ZonesListProps) {
  const { zones, cattleCounts, selectedZoneId, setSelectedZoneId, setCattle } = useCattle()
  const [zoneCounts, setZoneCounts] = useState<Record<string, number>>({})

  // Al montar, pedir los conteos
  useEffect(() => {
    fetch("/api/zones/counts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setZoneCounts(data.data)
        else console.error("Error en counts:", data.error)
      })
      .catch((err) => console.error("Fetch counts zones failed:", err))
  }, [])

  const handleZoneClick = async (zoneId: string) => {
    const newZoneId = zoneId === selectedZoneId ? null : zoneId
    setSelectedZoneId(newZoneId)
    onItemClick?.()

    try {
      const res = await fetch(`/api/cattle${newZoneId ? `?zoneId=${newZoneId}` : ""}`)
      const data = await res.json()
      if (data.success) setCattle(data.data)
      else console.error("Error al filtrar ganado por zona:", data.error)
    } catch (err) {
      console.error("Error al consultar vacas por zona:", err)
    }
  }

  return (
    <div className="space-y-1">
      {zones.map((zone) => (
        <button
          key={zone.id}
          className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md transition-colors ${
            selectedZoneId === zone.id ? "bg-green-100 text-green-900" : "text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => handleZoneClick(zone.id)}
        >
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: zone.color }} />
            <span className="truncate">{zone.name}</span>
          </div>
<span className="text-xs font-medium bg-gray-100 rounded-full px-2 py-0.5">
  {zone.id === "farm" ? cattleCounts.farm : cattleCounts[zone.id] || 0}
</span>
        </button>
      ))}
    </div>
  )
}
