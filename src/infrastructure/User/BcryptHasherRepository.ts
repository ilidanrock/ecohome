import bcrypt from "bcryptjs";
import { HasherRepository } from "@/src/domain/User/HasherRepository";

export class BcryptHasherRepository implements HasherRepository {
    
    async hash(password: string): Promise<string> {
        return bcrypt.hashSync(password, 10);
    }
    
    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compareSync(password, hash);
    }
}
