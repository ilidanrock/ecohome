import { nanoid } from 'nanoid';
import { GeneratorIdRepository } from '@/src/domain/VerifyToken/GeneratorIdRepository';

export class NanoIdRepository implements GeneratorIdRepository {
  generateId(): string {
    return nanoid();
  }
}
