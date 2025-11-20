import { ModelDto } from '../../dto/responses/ModelDto';

/**
 * Command para atualizar modelo existente
 * RF04.1 - Atualizar Modelo de IA
 */
export class UpdateModelCommand {
  id!: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Interface do handler
 */
export interface IUpdateModelCommandHandler {
  handle(command: UpdateModelCommand): Promise<ModelDto>;
}
