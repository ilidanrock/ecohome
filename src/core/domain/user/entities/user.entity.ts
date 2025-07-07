import { User as PrismaUser } from '@prisma/client';

export type UserRole = 'USER' | 'ADMIN' | 'NULL';

export interface UserProps {
  name: string | null;
  surname: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  // Factory method para crear un usuario desde Prisma
  static fromPrisma(user: Omit<PrismaUser, 'id'>): User {
    return new User({
      name: user.name,
      surname: user.surname,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      password: user.password,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  // Getters

  get name(): string | null { return this.props.name; }
  get email(): string { return this.props.email; }
  get emailVerified(): Date | null { return this.props.emailVerified; }
  get image(): string | null { return this.props.image; }
  get role(): UserRole { return this.props.role; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  // Métodos de dominio
  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updateRole(role: UserRole): void {
    this.props.role = role;
    this.props.updatedAt = new Date();
  }

  // Convertir a objeto plano
  toJSON() {
    return { ...this.props };
  }
}
