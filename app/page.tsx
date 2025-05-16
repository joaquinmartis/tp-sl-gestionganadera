import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"
import { getSession } from "@/lib/auth"

export default async function Home() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-800">GanaTech</h1>
          <p className="mt-2 text-gray-600">Sistema de gestión ganadera</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
