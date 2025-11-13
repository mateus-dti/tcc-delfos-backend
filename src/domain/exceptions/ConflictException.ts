import { AppException } from './AppException';

/**
 * Exceção para conflitos (ex: recurso já existe)
 */
export class ConflictException extends AppException {
  statusCode = 409;
  errorCode = 'CONFLICT';

  constructor(message: string, public conflictingField?: string) {
    super(message, { conflictingField });
  }
}

