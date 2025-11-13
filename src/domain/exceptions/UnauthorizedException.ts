import { AppException } from './AppException';

/**
 * Exceção para erros de autenticação/autorização
 */
export class UnauthorizedException extends AppException {
  statusCode = 401;
  errorCode = 'UNAUTHORIZED';

  constructor(message: string = 'Não autorizado - Token inválido ou ausente') {
    super(message);
  }
}

