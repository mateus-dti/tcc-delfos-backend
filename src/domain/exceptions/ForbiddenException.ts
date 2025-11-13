import { AppException } from './AppException';

/**
 * Exceção para acesso negado (sem permissão)
 */
export class ForbiddenException extends AppException {
  statusCode = 403;
  errorCode = 'FORBIDDEN';

  constructor(message: string = 'Acesso negado - Você não tem permissão para realizar esta ação') {
    super(message);
  }
}

