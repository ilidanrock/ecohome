import { VerifyToken } from "./VerifyToken";

export interface VerifyTokenRepository {
    createVerifyToken(verifyToken: VerifyToken): Promise<void>;
    findVerifyTokenByIdentifier(identifier: string): Promise<VerifyToken | null>;
    deleteVerifyToken(identifier: string): Promise<void>;
}
    