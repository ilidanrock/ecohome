import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { sql } from "@vercel/postgres"

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json()

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Este correo electrónico ya está registrado" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await hash(password, 12)

    // Create the user
    const result = await sql`
      INSERT INTO users (email, name, password, role) 
      VALUES (${email}, ${name}, ${hashedPassword}, 'user') 
      RETURNING id, email, name, role
    `
    

    return NextResponse.json(
      { 
        message: "Usuario registrado exitosamente",
        user: result.rows[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error en el registro:", error)
    return NextResponse.json(
      { error: "Error al registrar el usuario" },
      { status: 500 }
    )
  }
}
