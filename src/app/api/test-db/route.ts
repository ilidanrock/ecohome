import { NextResponse } from "next/server"
import {sql} from "@vercel/postgres"

export async function GET() {
  try {

    
    // Intentar una consulta simple
    const result = await sql`SELECT NOW()`
    
    return NextResponse.json({
      status: "success",
      message: "Conexión a la base de datos exitosa",
      timestamp: result.rows[0].now
    })
  } catch (error) {
    console.error("Error de conexión:", error)
    return NextResponse.json(
      { 
        status: "error",
        message: "Error al conectar con la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
} 