import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/cattle
 * Obtiene la lista de ganado con opciones de filtrado
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const zoneId = searchParams.get("zoneId");
    const connected = searchParams.get("connected");
    const lat = searchParams.get("lat")
      ? Number.parseFloat(searchParams.get("lat") || "")
      : null;
    const lng = searchParams.get("lng")
      ? Number.parseFloat(searchParams.get("lng") || "")
      : null;
    const radius = searchParams.get("radius")
      ? Number.parseFloat(searchParams.get("radius") || "")
      : null;

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("cattle")

    let cattle = await collection.find().toArray()
    // Simulación de datos de ganado

    // Función para calcular la distancia entre dos puntos (Haversine formula)
    function calculateDistance(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number {
      const R = 6371; // Radio de la Tierra en km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distancia en km
    }

    // Aplicar filtros
    let filteredCattle = cattle;

    // Filtrar por término de búsqueda
    if (search) {
      filteredCattle = filteredCattle.filter((cow) =>
        cow.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrar por zona
    if (zoneId) {
      filteredCattle = filteredCattle.filter((cow) => cow.zoneId === zoneId);
    }

    // Filtrar por estado de conexión
    if (connected !== null) {
      const isConnected = connected === "true";
      filteredCattle = filteredCattle.filter(
        (cow) => cow.connected === isConnected
      );
    }

    // Filtrar por ubicación (coordenadas y radio)
    if (lat !== null && lng !== null && radius !== null) {
      filteredCattle = filteredCattle.filter((cow) => {
        const distance = calculateDistance(
          lat,
          lng,
          cow.position[0],
          cow.position[1]
        );
        return distance <= radius;
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: filteredCattle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener ganado:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener ganado",
      },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validar campos requeridos (id ya no es requerido)
    const requiredFields = [
      "name",
      "description",
      "imageUrl",
      "position",
      "connected",
      "zoneId",
    ];
    for (const field of requiredFields) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        (typeof body[field] === "string" && body[field].trim() === "") ||
        (field === "position" &&
          (!Array.isArray(body.position) || body.position.length !== 2))
      ) {
        return NextResponse.json(
          { success: false, error: `El campo '${field}' es requerido.` },
          { status: 400 }
        );
      }
    }

    // Generar id automáticamente (por ejemplo, usando Date.now y Math.random)
    const generatedId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Validar y construir el objeto con el formato requerido
    const newCow = {
      id: generatedId,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      position: [Number(body.position[0]), Number(body.position[1])],
      connected: Boolean(body.connected),
      zoneId: body.zoneId,
    };

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("cattle");

    await collection.insertOne(newCow);

    return NextResponse.json(
      { success: true, message: "Animal insertado correctamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al insertar ganado:", error);
    return NextResponse.json(
      { success: false, error: "Error al insertar ganado" },
      { status: 500 }
    );
  }
}
