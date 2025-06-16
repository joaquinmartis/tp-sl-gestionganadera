"use server";

import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

// Simulación de autenticación

export async function login(email: string, password: string) {
  const client = await clientPromise;
  const db = client.db();
  const usersCollection = db.collection("users");

  console.log("Conectado a la base de datos para autenticación");

  // Buscar usuario por email
  const user = await usersCollection.findOne({ email });
  if (!user) throw new Error("Credenciales inválidas");

  // Comparar password con hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Credenciales inválidas");

  // Crear sesión
  const session = {
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
      id: user._id.toString(),
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
  } as any;

  // Guardar sesión en cookie httpOnly
  (await cookies()).set("session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 día
    path: "/",
  });

  if (!session) {
    throw new Error("Credenciales inválidas");
  }
  return session;
}

export async function logout() {
  (await cookies()).delete("session");
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session");

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);

    // Verificar si la sesión ha expirado
    if (new Date(session.expires) < new Date()) {
      (await cookies()).delete("session");
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}
