"use server"



export async function signUpAction() {
  try {



  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }
    return "Algo no fue bien en el registro"
  }
} 