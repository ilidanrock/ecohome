"use server"
import { sql } from "@vercel/postgres";
import { hash } from "bcryptjs";

export async function getUserFromDb(email: string) {
  try {
    const user = await sql`
        SELECT id, email, name, password, role
        FROM users
        WHERE email = ${email}`;
    const result = await user;
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting user from database:", error);
    throw error;
  }
}

type registerPost = {
  email: string;
  name: string;
  surname: string;
  role: string;
  password: string;
};
export async function postRegisterUser({
  email,
  name,
  surname,
  role,
  password,
}: registerPost) {
  try {
    // Verifica si ya existe un usuario con ese email
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.rows.length > 0) {
      throw new Error("El usuario ya existe");
    }
    const hashedPassword = await hash(password, 12);

    const res = await sql`
  INSERT INTO users (email, name, surname, password, role)
  VALUES (${email}, ${name}, ${surname}, ${hashedPassword}, ${role})
  RETURNING id, email, name, surname, role, is_active, last_login, deleted_at, created_at, updated_at
`;
    if (res.rows.length > 0) {
      return res.rows;
    }
  } catch (error) {
    throw error;
  }
}
