import { IUserRepository } from "@/src/domain/User/UserRepository";
import { User } from "@/src/domain/User/User";
import { HasherRepository } from "@/src/domain/User/HasherRepository";

export class UserCreate {
  constructor(
    private userRepository: IUserRepository,
    private hasherRepository: HasherRepository
  ) {}

  async execute(user: User) {
    const hashedPassword = await this.hasherRepository.hash(user.passwordUser);
    user.passwordUser = hashedPassword;
    
    return this.userRepository.createUser(user);
  }
}
