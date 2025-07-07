import { User } from "@/src/core/domain/user/entities/user.entity";
import { UserRepositoryPort } from "@/src/core/domain/user/ports/user.repository.port";


export interface RegisterCommand {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'NULL';
}

export class RegisterUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(command: RegisterCommand): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      // Verificar si el correo ya está registrado
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser) {
        return { 
          success: false, 
          error: 'Correo ya registrado' 
        };
      }

      // Crear el usuario (sin guardar aún)
      const user = User.fromPrisma({
        name: command.name,
        surname: command.surname,
        password: command.password,
        email: command.email,
        emailVerified: null,
        image: null,
        role: command.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Aquí iría la lógica para hashear la contraseña
      // const hashedPassword = await this.passwordService.hash(command.password);

      // Guardar el usuario
      await this.userRepository.save(user);

      return { 
        success: true, 
        user 
      };
    } catch (error) {
      console.error('Error en RegisterUseCase:', error);
      return { 
        success: false, 
        error: 'Error al crear el usuario' 
      };
    }
  }
}
