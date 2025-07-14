import { User } from "@/src/core/domain/user/entities/user.entity";
import { UserRepositoryPort } from "@/src/core/domain/user/ports/user.repository.port";
import { IPasswordService } from "@/src/core/domain/auth/ports/password.service.port";


export interface RegisterCommand {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'NULL';
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordService: IPasswordService
  ) {}

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
      // Hash the password before creating the user
      const hashedPassword = await this.passwordService.hashPassword(command.password);

      // Create user with hashed password
      const userProps = {
        name: command.name,
        surname: command.surname,
        password: hashedPassword,
        email: command.email,
        emailVerified: null,
        image: null,
        role: command.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      const user = new User(userProps);

      // Save the user to the database
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
