import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { AppException } from '../../domain/exceptions/AppException';
import { ValidationException } from '../../domain/exceptions/ValidationException';
import { NotFoundException } from '../../domain/exceptions/NotFoundException';
import { UnauthorizedException } from '../../domain/exceptions/UnauthorizedException';
import { ForbiddenException } from '../../domain/exceptions/ForbiddenException';
import { ConflictException } from '../../domain/exceptions/ConflictException';
import { DatabaseException } from '../../domain/exceptions/DatabaseException';

export function errorHandlerMiddleware(logger: Logger) {
  return (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // Se for uma exceção customizada da aplicação
    if (err instanceof AppException) {
      logger.warn('Application exception:', {
        errorCode: err.errorCode,
        message: err.message,
        details: err.details,
        path: req.path,
        method: req.method,
        statusCode: err.statusCode,
      });

      return res.status(err.statusCode).json(err.toJSON());
    }

    // Erros de validação do class-validator
    if (err.name === 'ValidationError' || Array.isArray((err as any).errors)) {
      const validationErrors = (err as any).errors || [];
      const exception = new ValidationException(
        'Erro de validação nos dados fornecidos',
        validationErrors
      );
      logger.warn('Validation error:', {
        errors: validationErrors,
        path: req.path,
        method: req.method,
      });
      return res.status(exception.statusCode).json(exception.toJSON());
    }

    // Erros de banco de dados (TypeORM, PostgreSQL, etc)
    if (
      err.message?.includes('duplicate key') ||
      err.message?.includes('unique constraint') ||
      err.message?.includes('violates unique constraint') ||
      err.message?.includes('already exists')
    ) {
      const exception = new ConflictException(
        'O recurso que você está tentando criar já existe',
        'duplicate'
      );
      logger.warn('Conflict error:', {
        message: err.message,
        path: req.path,
        method: req.method,
      });
      return res.status(exception.statusCode).json(exception.toJSON());
    }

    // Erros de conexão com banco de dados
    if (
      err.message?.includes('ECONNREFUSED') ||
      err.message?.includes('connection') ||
      err.message?.includes('database') ||
      err.message?.includes('timeout')
    ) {
      const exception = new DatabaseException(
        'Erro ao conectar com o banco de dados. Tente novamente mais tarde.',
        err
      );
      logger.error('Database error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
      return res.status(exception.statusCode).json(exception.toJSON());
    }

    // Erro genérico não tratado
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      name: err.name,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.'
          : err.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: err.stack,
          details: {
            name: err.name,
            message: err.message,
          },
        }),
      },
    });
  };
}

