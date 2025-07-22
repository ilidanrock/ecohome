import { role } from "@/types/user";

export class User {
  name: string;
  surname: string;
  password: string;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: role;
  createdAt: Date;
  updatedAt: Date;
  constructor(
    name: string,
    surname: string,
    password: string,
    email: string,
    emailVerified: Date | null,
    image: string | null,
    role: role,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.name = name;
    this.surname = surname;
    this.password = password;
    this.email = email;
    this.emailVerified = emailVerified;
    this.image = image;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  private get nameUser() {
    return this.name;
  }
  private get surnameUser() {
    return this.surname;
  }
  private get emailUser() {
    return this.email;
  }
  private get roleUser() {
    return this.role;
  }
  private get createdAtUser() {
    return this.createdAt;
  }
  private get updatedAtUser() {
    return this.updatedAt;
  }
  public get passwordUser() {
    return this.password;
  }
  public set passwordUser(password: string) {
    this.password = password;
  }
}
