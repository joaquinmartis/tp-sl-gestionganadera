import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

/**
 * GET /api/dashboard
 * Obtiene los datos para el dashboard
 */
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    const totalCattle = await db.collection("cattle").countDocuments()
    const connectedCattle = await db
      .collection("cattle")
      .countDocuments({ connected: true })
    const totalZones = await db.collection("zones").countDocuments()

    const dashboardData = {
      totalCattle,
      connectedCattle,
      totalZones,
      alerts: 0,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: dashboardData,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener datos del dashboard",
      },
      { status: 500 },
    )
  }
}
