import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * GET /api/zones
 * Obtiene la lista de zonas con coordenadas transformadas a [lat, lng]
 */
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("zones")

    let zones = await collection.find().toArray()

    // Invertir coordenadas para el frontend
    const zonesWithLatLng = zones.map((zone) => ({
      ...zone,
      geometry: {
        ...zone.geometry,
      coordinates: (zone.geometry.coordinates as [number, number][][]).map(
        (polygon: [number, number][]) =>
          polygon.map(([lng, lat]: [number, number]) => [lat, lng])
      ),

      }
    }))

    return NextResponse.json(
      {
        success: true,
        data: zonesWithLatLng,
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
