import { role } from "@/types/user";

export class User {
  id?: string;
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
    surname:string,
    password: string,
    email: string,
    emailVerified: Date | null,
    image: string | null,
    role: role,
    createdAt: Date,
    updatedAt: Date,
    id?: string,
  ) {
    this.id = id;
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

  public nameUser() {
    return this.name;
  }
  public surnameUser() {
    return this.surname;
  }
  public emailUser() {
    return this.email;
  }
  public roleUser() {
    return this.role;
  }
  public createdAtUser() {
    return this.createdAt;
  }
  public updatedAtUser() {
    return this.updatedAt;
  }
  public passwordUser() {
    return this.password;
  }
  public setPasswordUser(password: string) {
    this.password = password;
  }
}
