import { GetModelsQuery, IGetModelsQueryHandler } from './GetPublicModelsQuery';
import { ModelsListResponseDto, ModelDto } from '../../dto/responses/ModelDto';
import { ModelRepository } from '../../../infrastructure/repositories/ModelRepository';
import { ModelOrigin } from '../../../domain/entities/Model';
import { createLogger } from '../../../infrastructure/config/logger';

/**
 * Handler para listar modelos do banco de dados
 * RF04.1 - Listar Modelos
 */
export class GetModelsQueryHandler implements IGetModelsQueryHandler {
  private logger = createLogger();

  constructor(private modelRepository: ModelRepository) {}

  async handle(query: GetModelsQuery): Promise<ModelsListResponseDto> {
    try {
      this.logger.info('Processando query GetModels', {
        origin: query.origin,
        search: query.search,
      });

      let models;

      // Se há busca por texto
      if (query.search) {
        models = await this.modelRepository.searchByName(query.search);
      }
      // Se há filtro de origem
      else if (query.origin) {
        const origin = query.origin === 'OpenRouter' ? ModelOrigin.OpenRouter : ModelOrigin.Internal;
        models = await this.modelRepository.getAllByOrigin(origin);
      }
      // Busca todos
      else {
        models = await this.modelRepository.getAll();
      }

      // Mapear para DTOs
      const modelDtos: ModelDto[] = models.map(model => ({
        id: model.id,
        name: model.name,
        identifier: model.identifier,
        description: model.description,
        origin: model.origin as 'OpenRouter' | 'Internal',
        isActive: model.isActive,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
      }));

      this.logger.info(`Retornando ${modelDtos.length} modelos`);

      return {
        models: modelDtos,
        total: modelDtos.length,
      };
    } catch (error) {
      this.logger.error('Erro ao processar GetModelsQuery:', error);
      throw error;
    }
  }
}
