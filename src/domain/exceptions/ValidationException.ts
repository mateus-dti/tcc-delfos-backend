import { AppException } from './AppException';

/**
 * Exceção para erros de validação
 */
export class ValidationException extends AppException {
  statusCode = 400;
  errorCode = 'VALIDATION_ERROR';

  constructor(message: string, public validationErrors?: any[]) {
    super(message, { validationErrors });
  }
}

