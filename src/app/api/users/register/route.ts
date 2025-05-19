import { NextRequest, NextResponse } from "next/server"

import { postRegisterUser } from "@/services/userService";


export async function POST(request: NextRequest) {

  try {
    
    const { email, name, password , role , surname } = await request.json()

    // Check if user already exists
    const result = await postRegisterUser({
      email,
      name,
      password,
      role,
      surname
    })

    console.log("RESULT",result);
    

    if (result && Array.isArray(result) && result.length > 0) {
      return NextResponse.json(
        { 
          message: "Usuario registrado exitosamente",
          user: result[0]
        },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { error: "No se pudo registrar el usuario" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Error en el registro:", error)
    return NextResponse.json(
      { error: `Error al registrar el usuario ${error}`  },
      { status: 500 }
    )
  }
}
