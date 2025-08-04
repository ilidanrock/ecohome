import { PrismaClient, User as PrismaUser } from "@prisma/client";

import { IUserRepository } from "@/src/domain/User/UserRepository";
import { User } from "@/src/domain/User/User";

export class PrismaUserRepository implements IUserRepository {
    constructor(private prisma: PrismaClient) {}

    async createUser(user: User): Promise<User> {
        const newUser = await this.prisma.$transaction(async (tx) => {
            // 1. Create the user
            const createdUser = await tx.user.create({
                data: {
                    id: user.id,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                    role: user.role,
                    password: user.password,
                    emailVerified: user.emailVerified,
                    image: user.image,
                },
            });

            console.log(createdUser);
            
    
            // 2. Create the credentials account
            await tx.account.create({
                data: {
                    userId: createdUser.id,
                    type: 'credentials',
                    provider: 'credentials',
                    providerAccountId: createdUser.id,
                },
            });

            return createdUser;
        });
                
        return this.mapToDomain(newUser);
    }
    
    async findUserById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });
        return user ? this.mapToDomain(user) : null;
    }
    
    async findUserByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        return user ? this.mapToDomain(user) : null;
    }
    
    async findAllUsers(): Promise<User[]> {
        const users = await this.prisma.user.findMany();
        return users.map(user => this.mapToDomain(user));
    }
    
    private mapToDomain(prismaUser: PrismaUser): User {
        return new User(
            prismaUser.name ?? '',
            prismaUser.surname ?? '',
            prismaUser.password ?? '',
            prismaUser.email,
            prismaUser.emailVerified,
            prismaUser.image ?? '',
            prismaUser.role,
            prismaUser.createdAt,
            prismaUser.updatedAt,
            prismaUser.id,
        );
    }

    async updateUser(user: User): Promise<User>{
        const updatedUser = await this.prisma.user.update({
            where: {
                email: user.email,
            },
            data: {
                name: user.name,
                surname: user.surname,
                password: user.password,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
        return this.mapToDomain(updatedUser);
    }
    
    async deleteUser(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: {
                id,
            },
        });
    }
}   