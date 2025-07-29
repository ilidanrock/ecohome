import { nanoid } from "nanoid";
import { GeneratorIdRepository } from "@/src/domain/VerifyToken/GeneratorIdRepository.ts";

export class NanoIdRepository implements GeneratorIdRepository {
    generateId(): string {
        return nanoid();
    }
}