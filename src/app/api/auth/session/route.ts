import { NextResponse } from 'next/server'
import { auth } from '../../../../../auth'

export async function GET() {
  try {
    const session = await auth()
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 