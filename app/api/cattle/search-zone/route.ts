import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * POST /api/cattle/search-zone
 * Busca vacas dentro de una zona personalizada dibujada en el mapa
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zone } = body;

    if (!zone || !zone.geometry) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere una zona válida con geometría",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("cattle");

    // Construir filtro geoespacial usando la geometría de la zona
    const filters: any = {
      position: {
        $geoWithin: {
          $geometry: zone.geometry
        }
      }
    };

    // Ejecutar consulta geoespacial
    const cattle = await collection.find(filters).toArray();

    return NextResponse.json(
      {
        success: true,
        data: cattle,
        count: cattle.length,
        zone: {
          name: zone.properties?.name || "Zona Personalizada",
          geometry: zone.geometry
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al buscar vacas en la zona:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al buscar vacas en la zona",
      },
      { status: 500 }
    );
  }
} 