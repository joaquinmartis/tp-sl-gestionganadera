import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/zones
 * Obtiene la lista de zonas
 */
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("zones")

    let zones = await collection.find().toArray()

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
