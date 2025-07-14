export interface IPasswordService {
  hashPassword(password: string): Promise<string>;
  comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
