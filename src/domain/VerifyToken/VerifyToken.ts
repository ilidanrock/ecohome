export class VerifyToken {
  token: string | undefined;
  identifier: string;
  expiresAt: Date;

  constructor(identifier: string, expiresAt: Date, token?: string) {
    this.identifier = identifier;
    this.expiresAt = expiresAt;
    this.token = token;
  }

  public get tokenUser() {
    return this.token!;
  }
  public get identifierUser() {
    return this.identifier;
  }
  public get expiresAtUser() {
    return this.expiresAt;
  }
  public set tokenUser(token: string) {
    this.token = token;
  }
  public set identifierUser(identifier: string) {
    this.identifier = identifier;
  }
  public set expiresAtUser(expiresAt: Date) {
    this.expiresAt = expiresAt;
  }
}
