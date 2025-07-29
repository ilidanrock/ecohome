import { IUserRepository } from "@/src/domain/User/UserRepository";
import { User } from "@/src/domain/User/User";
import { HasherRepository } from "@/src/domain/User/HasherRepository";
import { VerifyTokenCreate } from "../VerifyToken/VerifyTokenCreate";
import { VerifyToken } from "@/src/domain/VerifyToken/VerifyToken";
import { CustomError } from "@/lib/auth";

export class UserCreate {
  constructor(
    private userRepository: IUserRepository,
    private hasherRepository: HasherRepository,
    private verifyTokenCreate: VerifyTokenCreate
  ) {}

  async execute(user: User) {
    const findUser = await this.userRepository.findUserByEmail(user.email);
    if (findUser) {
      throw new CustomError("Correo ya registrado", "USER_ALREADY_EXISTS", 401);
    }
    const hashedPassword = await this.hasherRepository.hash(user.password);
    user.password = hashedPassword;

        // Create the user first
        const createdUser = await this.userRepository.createUser(user);

        // Create and send verification token
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours
        
        const verifyToken = new VerifyToken(
          createdUser.email,
          expiresAt
        );
        
        await this.verifyTokenCreate.execute(verifyToken);
    
    
    return createdUser;
  }
}
