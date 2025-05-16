"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { login as loginAction, logout as logoutAction, getSession } from "@/lib/auth"

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const session = await loginAction(email, password)
      if (session?.user) {
        setUser(session.user)
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutAction()
      setUser(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
