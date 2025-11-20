import { ModelDto } from '../../dto/responses/ModelDto';

/**
 * Command para criar novo modelo
 * RF04.1 - Cadastrar Modelo de IA
 */
export class CreateModelCommand {
  name!: string;
  identifier!: string;
  description?: string;
  origin!: 'OpenRouter' | 'Internal';
}

/**
 * Interface do handler
 */
export interface ICreateModelCommandHandler {
  handle(command: CreateModelCommand): Promise<ModelDto>;
}
