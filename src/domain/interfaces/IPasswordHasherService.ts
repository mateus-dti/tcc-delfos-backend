export interface IPasswordHasherService {
  hashPassword(password: string): string;
  verifyPassword(password: string, passwordHash: string): boolean;
}

