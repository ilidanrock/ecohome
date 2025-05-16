import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  // Extraer el email de la URL

  const url = new URL(request.url);

  
  const email = url.pathname.split("/").pop();

  if (!email) {
    
    return NextResponse.json({ error: "Email no proporcionado" },
     { status: 400 });
  }
  console.log("Email no proporcionado", email);
  const { rows } = await sql`SELECT id, email, name, password, role FROM users WHERE email = ${email}`;
  const user = rows[0] || null;
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ user });
} 