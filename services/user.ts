import { prisma } from "@/prisma";
import { role } from "@/types/user";
import bcrypt from "bcryptjs";

export async function findUser(email: string) {
    return await prisma.user.findUnique({
            where: {
                email,
            },
        });
}

/**
 * Crea un usuario en la base de datos
 * @param email Correo electrónico del usuario
 * @param name Nombre del usuario
 * @param surname Apellido del usuario
 * @param role Rol del usuario (USER o ADMIN)
 * @param password Contrase a del usuario
 * @returns Promesa que se resuelve con el usuario creado
 */
export async function createUser(email: string, name: string, surname: string, role: role, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario y su cuenta de credenciales en una transacción
    await prisma.$transaction(async (tx) => {
      // 1. Crear el usuario
      const user = await tx.user.create({
        data: {
          name,
          surname,
          email,
          role,
          password: hashedPassword
        },
      });

      // 2. Crear la cuenta de credenciales
      await tx.account.create({
        data: {
          userId: user.id,
          type: 'credentials',
          provider: 'credentials',
          providerAccountId: user.id, // Usamos el ID de usuario como providerAccountId
        },
      });
    });
}
