// app/api/zones/counts/route.ts

import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { NextRequest } from "next/server"

export async function GET(_: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db()
    const zonesCollection = db.collection("zones")
    const cattleCollection = db.collection("cattle")

    // 1) Traer todas las zonas con su geometría
    const zones = await zonesCollection.find().toArray()

    // 2) Para cada zona, contar vacas cuyo `location` esté dentro del polígono
    const countsMap: Record<string, number> = {}

    for (const zone of zones) {
      const count = await cattleCollection.countDocuments({
        location: {
          $geoWithin: {
            $geometry: zone.geometry,
          },
        },
      })
      countsMap[zone.id] = count
    }

    return NextResponse.json(
      { success: true, data: countsMap },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error al obtener counts de zonas con geosearch:", error)
    return NextResponse.json(
      { success: false, error: "Error al obtener counts de zonas" },
      { status: 500 }
    )
  }
}
