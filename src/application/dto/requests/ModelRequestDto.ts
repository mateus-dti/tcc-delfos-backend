/**
 * DTO para criar um novo modelo
 * RF04.1 - Cadastrar modelo de IA
 */
export class CreateModelRequestDto {
  name!: string;
  identifier!: string; // Ex: "openai/gpt-4", "internal/custom-model"
  description?: string;
  origin!: 'OpenRouter' | 'Internal';
}

/**
 * DTO para atualizar um modelo existente
 */
export class UpdateModelRequestDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}
