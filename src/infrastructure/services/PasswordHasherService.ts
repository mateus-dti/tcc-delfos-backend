import * as bcrypt from 'bcrypt';
import { IPasswordHasherService } from '../../domain/interfaces/IPasswordHasherService';

export class PasswordHasherService implements IPasswordHasherService {
  private readonly workFactor = 12;

  hashPassword(password: string): string {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be null or empty');
    }

    return bcrypt.hashSync(password, this.workFactor);
  }

  verifyPassword(password: string, passwordHash: string): boolean {
    if (!password || !passwordHash || password.trim().length === 0 || passwordHash.trim().length === 0) {
      return false;
    }

    try {
      return bcrypt.compareSync(password, passwordHash);
    } catch {
      return false;
    }
  }
}

