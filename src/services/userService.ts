import {sql} from "@vercel/postgres"


export async function getUserFromDb(email: string) {

    try {
      const user = await sql`
        SELECT id, email, name, password, role
        FROM users
        WHERE email = ${email}`
      const result = await user;
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user from database:', error);
      throw error;
    }
  }


type registerPost = {
  email : string,
  name :string,
  surname : string,
  role : string 
  password : string
}
export async function postRegisterUser({
  email,
  name,
  surname,
  role,
  password
}: registerPost){

  try {
    return await sql`INSERT INTO users (email, name, surname,  password, role)
VALUES ( ${email}, ${name}, ${surname}, ${password}, ${role})`
    

  } catch (error) {
    throw error
  }
}