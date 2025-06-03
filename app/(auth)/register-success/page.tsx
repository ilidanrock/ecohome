import { Suspense } from "react"

import RegisterSuccess from "@/components/register-succes"



export default function RegisterSuccessPage() {



  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <Suspense fallback={<div>Cargando...</div>}>
        <RegisterSuccess  />
      </Suspense>
    </div>
  )
}
