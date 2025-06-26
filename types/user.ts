export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date | null;
  image?: string | null;
  role?: role;
  createdAt?: Date;
  updatedAt?: Date;
}

export type role = "USER" | "ADMIN" | "NULL"