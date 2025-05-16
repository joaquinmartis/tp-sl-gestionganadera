"use server"

import { cookies } from "next/headers"

// Simulación de autenticación
const VALID_EMAIL = "admin@ejemplo.com"
const VALID_PASSWORD = "password"

export async function login(email: string, password: string) {
  // En un entorno real, verificaríamos contra una base de datos
  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    // Crear una sesión simple
    const session = {
      user: {
        email,
        name: "Administrador",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    } as any

    // Guardar en cookies
    (await cookies()).set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    })

    return session
  }

  throw new Error("Credenciales inválidas")
}

export async function logout() {
  (await cookies()).delete("session")
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Verificar si la sesión ha expirado
    if (new Date(session.expires) < new Date()) {
      (await cookies()).delete("session")
      return null
    }

    return session
  } catch (error) {
    return null
  }
}
