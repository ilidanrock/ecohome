"use server";
import { CustomError } from "../../auth";

export async function signUpAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const surname = formData.get("surname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        surname,
        email,
        password,
        role,
      }),
    });
    if (!response.ok) {
      const error = await response.json();

      throw new CustomError(error.error || "Error de autenticación");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
    return "Algo no fue bien en el registro";
  }
}
