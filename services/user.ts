import { prisma } from "@/prisma";

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
import { User } from '@/src/core/domain/user/entities/user.entity';
import { PrismaUserRepository } from '@/src/infrastructure/persistence/prisma/user.repository';
import { PasswordService } from '@/src/infrastructure/auth/services/password.service';

export async function createUser(email: string, name: string, surname: string, role: 'USER' | 'ADMIN' | 'NULL', password: string) {
    const passwordService = new PasswordService();
    const userRepository = new PrismaUserRepository();
    
    // Hash the password
    const hashedPassword = await passwordService.hashPassword(password);
    
    // Create user entity
    const user = new User({
        name,
        surname,
        email,
        role,
        password: hashedPassword,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    
    // Save the user (this will also create the account in the transaction)
    await userRepository.save(user);
    
    return user;
}
