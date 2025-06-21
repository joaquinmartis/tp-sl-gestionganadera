import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/users
 * Obtiene la lista de usuarios usando el SDK nativo de MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Construir filtro para búsqueda (case insensitive)
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await usersCollection.countDocuments(filter);
    const users = await usersCollection
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .project({ password: 0 }) // ocultar password
      .toArray();

    const data = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : undefined,
    }));

    return NextResponse.json(
      {
        success: true,
        data,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener usuarios",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Crea un nuevo usuario usando el SDK nativo de MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "El formato del email no es válido" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Revisar si usuario ya existe
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: passwordHash,
      role: "Operador", // !!!?????
      createdAt: new Date(),
    };
    const result = await usersCollection.insertOne(newUser);

    const userResponse = {
      id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt.toISOString().split("T")[0],
    };

    return NextResponse.json(
      {
        success: true,
        data: userResponse,
        message: "Usuario creado correctamente",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear usuario",
      },
      { status: 500 }
    );
  }
}
