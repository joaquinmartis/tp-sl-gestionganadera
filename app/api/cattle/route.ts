import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/cattle
 * Obtiene la lista de ganado con opciones de filtrado
 */
export async function GET(request: NextRequest) {
  try {
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

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("cattle");

    let cattle = await collection.find().toArray();

    // Convertir coordinates a [lat, lng] para frontend
    cattle = cattle.map((cow) => ({
      ...cow,
      location: {
        ...cow.location,
        coordinates: [
          cow.location.coordinates[1], // lat
          cow.location.coordinates[0], // lng
        ],
      },
    }));

    function calculateDistance(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    // Filtros
    let filteredCattle = cattle;

    if (search) {
      filteredCattle = filteredCattle.filter((cow) =>
        cow.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (zoneId) {
      filteredCattle = filteredCattle.filter((cow) => cow.zoneId === zoneId);
    }

    if (connected !== null) {
      const isConnected = connected === "true";
      filteredCattle = filteredCattle.filter(
        (cow) => cow.connected === isConnected
      );
    }

    if (lat !== null && lng !== null && radius !== null) {
      filteredCattle = filteredCattle.filter((cow) => {
        const [cowLat, cowLng] = cow.location.coordinates;
        const distance = calculateDistance(lat, lng, cowLat, cowLng);
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

/**
 * POST /api/cattle
 * Inserta una vaca con formato correcto GeoJSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    const [lat, lng] = body.position;
    const cowId = body.id || `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    const cowData = {
      id: cowId,
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      location: {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON
      },
      connected: Boolean(body.connected),
      zoneId: body.zoneId,
    };

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("cattle");

    const existing = await collection.findOne({ id: cowId });

    if (existing) {
      await collection.updateOne({ id: cowId }, { $set: cowData });
      return NextResponse.json(
        { success: true, message: "Vaca actualizada correctamente" },
        { status: 200 }
      );
    } else {
      await collection.insertOne(cowData);
      return NextResponse.json(
        { success: true, message: "Vaca insertada correctamente" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error al insertar/actualizar ganado:", error);
    return NextResponse.json(
      { success: false, error: "Error al insertar/actualizar ganado" },
      { status: 500 }
    );
  }
}

