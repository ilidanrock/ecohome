import { getSqlClient } from "@/lib/db";

export async function getUserFromDb(email: string) {
    const sql = getSqlClient();
    try {
      const user = await sql`
        SELECT id, email, name, password, role
        FROM users
        WHERE email = ${email}
      `;
      return user[0] || null;
    } catch (error) {
      console.error('Error getting user from database:', error);
      throw error;
    }
  }