import * as crypto from 'crypto';
import { IEncryptionService } from '../../domain/interfaces/IEncryptionService';

export class EncryptionService implements IEncryptionService {
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly tagLength = 16;
  private readonly ivLength = 12;

  constructor(encryptionKey: string) {
    if (!encryptionKey || encryptionKey.trim().length === 0) {
      throw new Error('Encryption key cannot be null or empty');
    }

    try {
      this.key = Buffer.from(encryptionKey, 'base64');
    } catch {
      // If not base64, use UTF8 bytes (not recommended but allows flexibility)
      const keyString = encryptionKey.padEnd(32).substring(0, 32);
      this.key = Buffer.from(keyString, 'utf8');
    }

    if (this.key.length !== 32) {
      throw new Error('Encryption key must be 32 bytes (256 bits)');
    }
  }

  encrypt(plainText: string): string {
    if (!plainText) {
      return plainText;
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const plainBytes = Buffer.from(plainText, 'utf8');
    const encrypted = Buffer.concat([
      cipher.update(plainBytes),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    // Combine iv + tag + encrypted
    const result = Buffer.concat([iv, tag, encrypted]);

    return result.toString('base64');
  }

  decrypt(cipherText: string): string {
    if (!cipherText) {
      return cipherText;
    }

    const encryptedBytes = Buffer.from(cipherText, 'base64');

    if (encryptedBytes.length < this.ivLength + this.tagLength) {
      throw new Error('Invalid cipher text');
    }

    const iv = encryptedBytes.subarray(0, this.ivLength);
    const tag = encryptedBytes.subarray(this.ivLength, this.ivLength + this.tagLength);
    const encrypted = encryptedBytes.subarray(this.ivLength + this.tagLength);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}

