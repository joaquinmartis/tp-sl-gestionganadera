import type { Cattle, Zone } from "@/lib/cattle-context"

const FARM_CENTER: [number, number] = [40.7128, -74.006]

const ZONE_COLORS = [
  "#3b82f6", "#ef4444", "#f97316", "#22c55e",
  "#a855f7", "#ec4899", "#84cc16",
]

const COW_NAMES = [
  "Bella", "Luna", "Estrella", "Manchas", "Flor",
  "Dulce", "Canela", "Lucero", "Princesa", "Margarita",
  "Violeta", "Rosa", "Azucena", "Perla", "Diamante",
  "Esmeralda", "Rubí", "Zafiro", "Ámbar", "Topacio",
]

const COW_DESCRIPTIONS = [
  "Holstein de 5 años, alta productora de leche",
  "Jersey de 3 años, excelente calidad de leche",
  "Angus de 4 años, buena para carne",
  "Hereford de 6 años, madre de 4 terneros",
  "Brahman de 2 años, resistente al calor",
  "Charolais de 7 años, gran tamaño",
  "Limousin de 3 años, buena musculatura",
  "Simmental de 4 años, doble propósito",
  "Gyr de 5 años, adaptable a climas cálidos",
  "Normando de 6 años, buena para leche y carne",
]

const COW_IMAGES = [
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
  "/placeholder.svg?height=200&width=200",
]

// Helper para transformar dos esquinas a un polígono
function toPolygon(bounds: [[number, number], [number, number]]) {
  const [[minLat, minLng], [maxLat, maxLng]] = bounds
  return {
    type: "Polygon",
    coordinates: [[
      [minLng, minLat],
      [minLng, maxLat],
      [maxLng, maxLat],
      [maxLng, minLat],
      [minLng, minLat] // cerrar el polígono
    ]]
  }
}

export function generateMockZones(): Zone[] {
  const farmZone: Zone = {
    id: "farm",
    name: "Granja Completa",
    description: "Perímetro completo de la granja",
    bounds: [
      [FARM_CENTER[0] - 0.01, FARM_CENTER[1] - 0.01],
      [FARM_CENTER[0] + 0.01, FARM_CENTER[1] + 0.01],
    ],
    color: ZONE_COLORS[0],
    geometry: toPolygon([
      [FARM_CENTER[0] - 0.01, FARM_CENTER[1] - 0.01],
      [FARM_CENTER[0] + 0.01, FARM_CENTER[1] + 0.01],
    ]),
  }

  const zones: Zone[] = [
    farmZone,
    {
      id: "stables",
      name: "Establos",
      description: "Área de descanso para el ganado",
      bounds: [
        [FARM_CENTER[0] - 0.008, FARM_CENTER[1] - 0.008],
        [FARM_CENTER[0] - 0.004, FARM_CENTER[1] - 0.004],
      ],
      color: ZONE_COLORS[1],
      geometry: toPolygon([
        [FARM_CENTER[0] - 0.008, FARM_CENTER[1] - 0.008],
        [FARM_CENTER[0] - 0.004, FARM_CENTER[1] - 0.004],
      ]),
    },
    {
      id: "feeders",
      name: "Comederos",
      description: "Área de alimentación",
      bounds: [
        [FARM_CENTER[0] - 0.008, FARM_CENTER[1] + 0.004],
        [FARM_CENTER[0] - 0.004, FARM_CENTER[1] + 0.008],
      ],
      color: ZONE_COLORS[2],
      geometry: toPolygon([
        [FARM_CENTER[0] - 0.008, FARM_CENTER[1] + 0.004],
        [FARM_CENTER[0] - 0.004, FARM_CENTER[1] + 0.008],
      ]),
    },
    {
      id: "waterers",
      name: "Bebederos",
      description: "Área de hidratación",
      bounds: [
        [FARM_CENTER[0] + 0.004, FARM_CENTER[1] - 0.008],
        [FARM_CENTER[0] + 0.008, FARM_CENTER[1] - 0.004],
      ],
      color: ZONE_COLORS[3],
      geometry: toPolygon([
        [FARM_CENTER[0] + 0.004, FARM_CENTER[1] - 0.008],
        [FARM_CENTER[0] + 0.008, FARM_CENTER[1] - 0.004],
      ]),
    },
    {
      id: "milking",
      name: "Áreas de Ordeño",
      description: "Zona de producción de leche",
      bounds: [
        [FARM_CENTER[0] + 0.004, FARM_CENTER[1] + 0.004],
        [FARM_CENTER[0] + 0.008, FARM_CENTER[1] + 0.008],
      ],
      color: ZONE_COLORS[4],
      geometry: toPolygon([
        [FARM_CENTER[0] + 0.004, FARM_CENTER[1] + 0.004],
        [FARM_CENTER[0] + 0.008, FARM_CENTER[1] + 0.008],
      ]),
    },
    {
      id: "maternity",
      name: "Maternidades",
      description: "Área para vacas preñadas y recién paridas",
      bounds: [
        [FARM_CENTER[0] - 0.002, FARM_CENTER[1] - 0.002],
        [FARM_CENTER[0] + 0.002, FARM_CENTER[1] + 0.002],
      ],
      color: ZONE_COLORS[5],
      geometry: toPolygon([
        [FARM_CENTER[0] - 0.002, FARM_CENTER[1] - 0.002],
        [FARM_CENTER[0] + 0.002, FARM_CENTER[1] + 0.002],
      ]),
    },
    {
      id: "pasture",
      name: "Áreas de Pastoreo",
      description: "Zonas de alimentación natural",
      bounds: [
        [FARM_CENTER[0] - 0.006, FARM_CENTER[1] - 0.001],
        [FARM_CENTER[0] - 0.001, FARM_CENTER[1] + 0.006],
      ],
      color: ZONE_COLORS[6],
      geometry: toPolygon([
        [FARM_CENTER[0] - 0.006, FARM_CENTER[1] - 0.001],
        [FARM_CENTER[0] - 0.001, FARM_CENTER[1] + 0.006],
      ]),
    },
  ]

  return zones
}

export function generateMockCattle(zones: Zone[]): Cattle[] {
  const cattle: Cattle[] = []

  for (let i = 0; i < 20; i++) {
    const farmZone = zones[0]
    const [[minLat, minLng], [maxLat, maxLng]] = farmZone.bounds

    const randomLat = minLat + Math.random() * (maxLat - minLat)
    const randomLng = minLng + Math.random() * (maxLng - minLng)

    let zoneId: string | null = null
    for (const zone of zones) {
      const [[zMinLat, zMinLng], [zMaxLat, zMaxLng]] = zone.bounds
      if (randomLat >= zMinLat && randomLat <= zMaxLat && randomLng >= zMinLng && randomLng <= zMaxLng) {
        zoneId = zone.id
        break
      }
    }

    cattle.push({
      id: `cow-${i + 1}`,
      name: COW_NAMES[i % COW_NAMES.length],
      description: COW_DESCRIPTIONS[i % COW_DESCRIPTIONS.length],
      imageUrl: COW_IMAGES[i % COW_IMAGES.length],
      location: {
        type: "Point",
        coordinates: [randomLng, randomLat],
      },
      connected: Math.random() > 0.1,
      zoneId,
    })
  }

  return cattle
}
