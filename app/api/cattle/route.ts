import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/cattle
 * Obtiene la lista de ganado con opciones de filtrado usando GeoSearch
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const zoneId = searchParams.get("zoneId");
    const connected = searchParams.get("connected");

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection("cattle")

    // Construir filtros para la consulta
    const filters: any = {}

    // Filtrar por término de búsqueda
    if (search) {
      filters.name = { $regex: search, $options: 'i' }
    }

    // Filtrar por estado de conexión
    if (connected !== null) {
      filters.connected = connected === "true"
    }

    // Filtrar por zona usando geolocalización
    if (zoneId) {
      // Obtener la zona para obtener sus bounds
      const zonesCollection = db.collection("zones");
      const zona = await zonesCollection.findOne({ id: zoneId });
      
      console.log("Zona encontrada:", zona);
      
      if (zona && zona.bounds) {
        console.log("Bounds de la zona:", zona.bounds);
        
        filters.position = {
          $geoWithin: {
            $geometry: zona.bounds
          }
        };
        
        console.log("Filtro aplicado:", filters);
      } else {
        console.log("Zona no encontrada o sin bounds:", zoneId);
      }
    }

    // Consulta a la base de datos con todos los filtros aplicados
    console.log("Filtros finales:", filters);
    const cattle = await collection.find(filters).toArray()
    console.log("Resultados encontrados:", cattle.length);

    return NextResponse.json(
      {
        success: true,
        data: cattle,
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
