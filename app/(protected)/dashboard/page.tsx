
import { auth } from "@/auth"
import { redirect } from "next/navigation"

 
export default async function Page() {
  const session = await auth()
 
  if (!session) {
    redirect("/login")
    return <div>Not authenticated</div>
  }
 
  return (
    <div className="container">
    </div>
  )
}
