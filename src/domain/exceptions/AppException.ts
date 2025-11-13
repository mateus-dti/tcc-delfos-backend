/**
 * Classe base para exceções da aplicação
 */
export abstract class AppException extends Error {
  abstract statusCode: number;
  abstract errorCode: string;

  constructor(message: string, public details?: any) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details,
      },
    };
  }
}

