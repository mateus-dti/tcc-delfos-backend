import { AppException } from './AppException';

/**
 * Exceção para erros de banco de dados
 */
export class DatabaseException extends AppException {
  statusCode = 500;
  errorCode = 'DATABASE_ERROR';

  constructor(message: string = 'Erro ao acessar o banco de dados', public originalError?: any) {
    super(message, { originalError: originalError?.message });
  }
}

