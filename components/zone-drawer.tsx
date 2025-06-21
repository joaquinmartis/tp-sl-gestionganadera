"use client"

import { useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-draw/dist/leaflet.draw.css"
import { useCattle } from "@/lib/cattle-context"
import ZoneSearchResults from "./zone-search-results"

// Importar Leaflet.Draw
import "leaflet-draw"

interface CustomZone {
  id: string
  name: string
  geometry: any
  color: string
}

export default function ZoneDrawer() {
  const map = useMap()
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const [customZones, setCustomZones] = useState<CustomZone[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [currentZoneName, setCurrentZoneName] = useState("")
  const { getCattleByZone } = useCattle()

  useEffect(() => {
    if (!map) return

    // Crear capa para los elementos dibujados
    drawnItemsRef.current = new L.FeatureGroup()
    map.addLayer(drawnItemsRef.current)

    // Crear control de dibujo
    drawControlRef.current = new (L.Control as any).Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: "#e1e100",
            message: "<strong>Error:</strong> El polígono no puede intersectarse consigo mismo",
          },
          shapeOptions: {
            color: "#3388ff",
            weight: 2,
          },
        },
        rectangle: {
          shapeOptions: {
            color: "#3388ff",
            weight: 2,
          },
        },
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    })

    map.addControl(drawControlRef.current)

    // Evento cuando se dibuja algo
    const handleDrawCreated = (e: any) => {
      const layer = e.layer
      const type = e.layerType

      // Generar ID único para la zona
      const zoneId = `custom-zone-${Date.now()}`
      
      // Generar color aleatorio
      const colors = ["#3b82f6", "#ef4444", "#f97316", "#22c55e", "#a855f7", "#ec4899", "#84cc16"]
      const color = colors[Math.floor(Math.random() * colors.length)]

      // Crear zona personalizada
      const customZone: CustomZone = {
        id: zoneId,
        name: `Zona Personalizada ${customZones.length + 1}`,
        geometry: layer.toGeoJSON(),
        color,
      }

      // Agregar a la lista de zonas personalizadas
      setCustomZones(prev => [...prev, customZone])

      // Estilizar la capa
      layer.setStyle({
        color,
        weight: 2,
        fillOpacity: 0.3,
      })

      // Agregar popup para editar nombre
      layer.bindPopup(`
        <div>
          <h3 class="font-semibold">${customZone.name}</h3>
          <input 
            type="text" 
            id="zone-name-${zoneId}" 
            value="${customZone.name}"
            class="w-full p-1 border rounded mt-2"
            placeholder="Nombre de la zona"
          />
          <button 
            onclick="updateZoneName('${zoneId}')"
            class="w-full bg-blue-500 text-white p-1 rounded mt-2"
          >
            Actualizar
          </button>
          <button 
            onclick="searchCattleInZone('${zoneId}')"
            class="w-full bg-green-500 text-white p-1 rounded mt-2"
          >
            Buscar Vacas
          </button>
        </div>
      `)

      // Agregar la capa al mapa
      drawnItemsRef.current.addLayer(layer)

      setIsDrawing(false)
    }

    // Evento cuando se elimina algo
    const handleDrawDeleted = (e: any) => {
      const layers = e.layers
      layers.eachLayer((layer: any) => {
        // Encontrar y eliminar la zona correspondiente
        const geoJSON = layer.toGeoJSON()
        setCustomZones(prev => prev.filter(zone => 
          JSON.stringify(zone.geometry) !== JSON.stringify(geoJSON)
        ))
      })
    }

    // Agregar eventos
    map.on((L as any).Draw.Event.CREATED, handleDrawCreated)
    map.on((L as any).Draw.Event.DELETED, handleDrawDeleted)

    // Agregar funciones globales para los botones del popup
    ;(window as any).updateZoneName = (zoneId: string) => {
      const input = document.getElementById(`zone-name-${zoneId}`) as HTMLInputElement
      if (input) {
        setCustomZones(prev => prev.map(zone => 
          zone.id === zoneId ? { ...zone, name: input.value } : zone
        ))
      }
    }

    ;(window as any).searchCattleInZone = async (zoneId: string) => {
      const zone = customZones.find(z => z.id === zoneId)
      if (zone) {
        try {
          // Enviar la zona al backend para buscar vacas
          const response = await fetch("/api/cattle/search-zone", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              zone: zone.geometry,
            }),
          })

          const data = await response.json()
          if (data.success) {
            // Mostrar resultados en el modal
            setSearchResults(data.data)
            setCurrentZoneName(zone.name)
            setShowResults(true)
          }
        } catch (error) {
          console.error("Error buscando vacas en la zona:", error)
        }
      }
    }

    return () => {
      // Limpiar eventos
      map.off((L as any).Draw.Event.CREATED, handleDrawCreated)
      map.off((L as any).Draw.Event.DELETED, handleDrawDeleted)
      
      // Remover control
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
      }
      
      // Remover capa
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current)
      }
    }
  }, [map, customZones])

  return (
    <>
      <ZoneSearchResults
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={searchResults}
        zoneName={currentZoneName}
      />
    </>
  )
} 