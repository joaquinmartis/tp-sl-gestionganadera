import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import UsersPage from "@/components/users-page"

export default async function Users() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return <UsersPage />
}
