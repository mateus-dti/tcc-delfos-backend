/**
 * Command para deletar modelo (soft delete)
 * RF04.1 - Deletar Modelo de IA
 */
export class DeleteModelCommand {
  id!: string;
}

/**
 * Interface do handler
 */
export interface IDeleteModelCommandHandler {
  handle(command: DeleteModelCommand): Promise<void>;
}
