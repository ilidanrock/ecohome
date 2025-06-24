import { withCORS } from '@/lib/cors'
import { prisma } from '@/prisma'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
 
export async function GET(request: NextRequest) {
  const {searchParams} = request.nextUrl

  const token = await searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token no proporcionado' }, { status: 400 })
  }

  const verifyTokenExist = await prisma.verificationToken.findFirst({
    where: {
      token
    }
  })

  const user = await prisma.user.findUnique({
    where: {
      email: verifyTokenExist?.identifier
    }
  })

  if (!verifyTokenExist) {
    // return NextResponse.json({ error: 'Token no encontrado' }, { status: 404 })
    return withCORS(request, NextResponse.json({ error: 'Token no encontrado' }, { status: 404 }))
  }

  if(user?.emailVerified){
    return withCORS(request, NextResponse.json({ error: 'Correo ya verificado' }, { status: 400 }))
  }



  if (verifyTokenExist.expires < new Date()) {
    return withCORS(request, NextResponse.json({ error: 'Token expirado' }, { status: 401 }))
  }
  

  const userUpdated = await prisma.user.update({
    where: {
      email: verifyTokenExist.identifier
    },
    data: {
      emailVerified: new Date()
    }
  })

  await prisma.verificationToken.delete({
    where: {
      identifier: verifyTokenExist.identifier
    }
  })

  if (!userUpdated) {
    return withCORS(request, NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 }))
  }

  return redirect("/login?verified=true")

}

export function OPTIONS(request: NextRequest) {
  return withCORS(request, new NextResponse(null, { status: 204 }))
}