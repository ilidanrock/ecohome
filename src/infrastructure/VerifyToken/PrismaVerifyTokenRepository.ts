import { PrismaClient } from "@prisma/client";
import { VerifyTokenRepository } from "@/src/domain/VerifyToken/VerifyTokenRepository";
import { VerifyToken } from "@/src/domain/VerifyToken/VerifyToken";

export class PrismaVerifyTokenRepository implements VerifyTokenRepository {
    constructor(private prisma: PrismaClient) {}

    async createVerifyToken(verifyToken: VerifyToken): Promise<void> {
        await this.prisma.verificationToken.create({
            data: {
                identifier: verifyToken.identifierUser,
                token: verifyToken.tokenUser,
                expires: verifyToken.expiresAtUser,
            },
        });
    }

    async findVerifyTokenByIdentifier(identifier: string): Promise<VerifyToken | null> {
        const verifyToken = await this.prisma.verificationToken.findUnique({
            where: {
                identifier,
            },
        });
        return verifyToken ? new VerifyToken( verifyToken.identifier, verifyToken.expires, verifyToken.token) : null;
    }

    async deleteVerifyToken(identifier: string): Promise<void> {
        await this.prisma.verificationToken.delete({
            where: {
                identifier,
            },
        });
    }
}