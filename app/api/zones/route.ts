import { NextResponse } from "next/server"

/**
 * GET /api/zones
 * Obtiene la lista de zonas
 */
export async function GET() {
  try {
    // Simulación de datos de zonas
    const zones = [
      {
        id: "farm",
        name: "Granja Completa",
        description: "Perímetro completo de la granja",
        bounds: [
          [40.7028, -74.016],
          [40.7228, -73.996],
        ],
        color: "#3b82f6",
      },
      {
        id: "stables",
        name: "Establos",
        description: "Área de descanso para el ganado",
        bounds: [
          [40.7048, -74.014],
          [40.7088, -74.01],
        ],
        color: "#ef4444",
      },
      // Otras zonas se agregarían aquí
    ]

    return NextResponse.json(
      {
        success: true,
        data: zones,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener zonas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener zonas",
      },
      { status: 500 },
    )
  }
}
