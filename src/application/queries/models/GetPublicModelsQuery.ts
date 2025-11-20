import { ModelsListResponseDto } from '../../dto/responses/ModelDto';

/**
 * Query para listar modelos disponíveis
 * RF04.1 - Listar Modelos do Banco de Dados
 */
export class GetModelsQuery {
  origin?: 'OpenRouter' | 'Internal'; // Filtra por origem
  search?: string; // Busca por nome, identifier ou descrição
}

/**
 * Interface do handler
 */
export interface IGetModelsQueryHandler {
  handle(query: GetModelsQuery): Promise<ModelsListResponseDto>;
}
