import { AppException } from './AppException';

/**
 * Exceção para recursos não encontrados
 */
export class NotFoundException extends AppException {
  statusCode = 404;
  errorCode = 'NOT_FOUND';

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} com identificador '${identifier}' não encontrado`
      : `${resource} não encontrado`;
    super(message, { resource, identifier });
  }
}

