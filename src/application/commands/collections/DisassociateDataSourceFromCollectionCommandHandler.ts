import {
  DisassociateDataSourceFromCollectionCommand,
  IDisassociateDataSourceFromCollectionCommandHandler,
} from './DisassociateDataSourceFromCollectionCommand';
import { IDataSourceRepository } from '../../../domain/interfaces/IDataSourceRepository';
import { ICollectionRepository } from '../../../domain/interfaces/ICollectionRepository';
import { NotFoundException } from '../../../domain/exceptions/NotFoundException';
import { DatabaseException } from '../../../domain/exceptions/DatabaseException';
import { UnauthorizedException } from '../../../domain/exceptions/UnauthorizedException';

export class DisassociateDataSourceFromCollectionCommandHandler
  implements IDisassociateDataSourceFromCollectionCommandHandler
{
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private collectionRepository: ICollectionRepository
  ) {}

  async handle(command: DisassociateDataSourceFromCollectionCommand): Promise<boolean> {
    try {
      // Verificar se a coleção existe
      const collection = await this.collectionRepository.getById(command.collectionId);
      if (!collection) {
        throw new NotFoundException('Coleção', command.collectionId);
      }

      // Verificar se o usuário é o dono da coleção
      if (collection.ownerId !== command.ownerId) {
        throw new UnauthorizedException(
          'Você não tem permissão para desassociar fontes de dados desta coleção.'
        );
      }

      // Verificar se a fonte de dados existe e pertence à coleção
      const dataSource = await this.dataSourceRepository.getById(command.dataSourceId);
      if (!dataSource) {
        throw new NotFoundException('Fonte de dados', command.dataSourceId);
      }

      if (dataSource.collectionId !== command.collectionId) {
        throw new NotFoundException(
          'Fonte de dados',
          command.dataSourceId,
          'A fonte de dados não pertence a esta coleção.'
        );
      }

      // Soft delete da fonte de dados
      const deleted = await this.dataSourceRepository.delete(command.dataSourceId);
      if (!deleted) {
        throw new NotFoundException('Fonte de dados', command.dataSourceId);
      }

      return true;
    } catch (error) {
      // Se já for uma exceção da aplicação, re-lança
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      // Erros de banco de dados
      throw new DatabaseException(
        'Erro ao desassociar fonte de dados da coleção. Por favor, tente novamente.',
        error
      );
    }
  }
}

