import { NextResponse, NextRequest } from 'next/server'
import { getUserFromDb } from '@/services/userService'
import { compare } from 'bcryptjs'
import { signInSchema } from '@/zod/sign-in-schema'
import { CustomError } from '../../../../../auth'


export async function GET(
  request: NextRequest,
) {
  try {
    const url = new URL(request.url)
    const emailFromUrl = url.pathname.split('/').pop()
    const userFromDb = await getUserFromDb(emailFromUrl || "")
    
    if (!userFromDb) {
      return NextResponse.json(
        { error: 'Usuario no registrado con ese email' },
        { status: 401 }
      )
    }

    const userWithoutPassword = { 
      id: userFromDb.id,
      email: userFromDb.email,
      name: userFromDb.name,
      role: userFromDb.role
    } 
    
    return NextResponse.json(userWithoutPassword)
  } catch (error: unknown) {
    console.error('Error getting user:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json()
    
    const url = new URL(request.url)
    const emailFromUrl = url.pathname.split('/').pop()
    
    
    const { email, password: passwordFromBody } = await signInSchema.parseAsync({
      email: emailFromUrl,
      password: body.password
    })

    const userFromDb = await getUserFromDb(email as string)
    
    if (!userFromDb) {
      return NextResponse.json(
        { error: 'Usuario no registrado con ese email' },
        { status: 401 }
      )
    }

    const user = {
      id: userFromDb.id,
      email: userFromDb.email,
      password: userFromDb.password,
      name: userFromDb.name,
      role: userFromDb.role
    }

    const passwordsMatch = await compare(passwordFromBody as string, user.password)
    
    if (!passwordsMatch) {
      return NextResponse.json(
        { error: 'Contraseña invalida' },
        { status: 401 }
      )
    }

    // Remove password from response
    const userWithoutPassword = { 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    } 
    
    return NextResponse.json(userWithoutPassword)
  } catch (error: unknown) {
    console.error('Error in email verification:', error)
    
    if (error instanceof CustomError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 