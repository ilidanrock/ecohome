import { IUserRepository } from "@/src/domain/User/UserRepository";

export class UserFind {
    constructor(
        private userRepository: IUserRepository
    ) {}
    async execute(email: string) {
        return this.userRepository.findUserByEmail(email);
    }
}
    