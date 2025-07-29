
import { VerifyTokenRepository } from "@/src/domain/VerifyToken/VerifyTokenRepository";
import { VerifyToken } from "@/src/domain/VerifyToken/VerifyToken";
import { EmailRepository } from "@/src/domain/VerifyToken/EmailRepository";
import { GeneratorIdRepository } from "@/src/domain/VerifyToken/GeneratorIdRepository.ts";

export class VerifyTokenCreate {
    constructor(
        private verifyTokenRepository: VerifyTokenRepository,
        private emailRepository: EmailRepository,
        private generatorIdRepository: GeneratorIdRepository
    ) {}
    
    async execute(verifyToken: VerifyToken) {
        verifyToken.tokenUser = this.generatorIdRepository.generateId();
        await this.emailRepository.sendEmail(verifyToken.identifierUser, verifyToken.tokenUser);

        return this.verifyTokenRepository.createVerifyToken(verifyToken);
    }
}