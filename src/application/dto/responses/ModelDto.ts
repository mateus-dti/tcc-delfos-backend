/**
 * DTO para representar um modelo de IA
 * RF04.1 - Modelos armazenados no banco de dados
 */
export class ModelDto {
  id!: string;
  name!: string;
  identifier!: string; // Ex: "openai/gpt-4", "internal/custom-model"
  description?: string;
  origin!: 'OpenRouter' | 'Internal';
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * DTO para resposta de lista de modelos
 */
export class ModelsListResponseDto {
  models!: ModelDto[];
  total!: number;
}
