import { nanoid } from "nanoid";
export class VerificationToken {
    private constructor(
      public readonly identifier: string,
      public readonly token: string,
      public readonly expires: Date
    ) {}
  
    static create(email: string, expiresInHours: number = 24): VerificationToken {
      const expires = new Date();
      expires.setHours(expires.getHours() + expiresInHours);
      
      return new VerificationToken(
        email,
        nanoid(),
        expires
      );
    }
  
    isExpired(): boolean {
      return new Date() > this.expires;
    }
  
    isValid(token: string): boolean {
      return this.token === token && !this.isExpired();
    }
  }