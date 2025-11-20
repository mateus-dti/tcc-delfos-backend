import axios from 'axios';
import { createLogger } from '../config/logger';

/**
 * Interface para modelo retornado pela API do OpenRouter
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  modalities?: string[];
  supported_generation_types?: string[];
}

/**
 * Interface para resposta da API do OpenRouter
 */
export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

/**
 * Cliente HTTP para comunicação com a API do OpenRouter
 * RF04.1 - Listar Modelos Públicos via OpenRouter
 */
export class OpenRouterClient {
  private client: any;
  private logger = createLogger();
  private readonly BASE_URL = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENROUTER_API_KEY;

    if (!key) {
      throw new Error(
        'OPENROUTER_API_KEY não está configurado. Adicione a variável de ambiente para usar o OpenRouter.'
      );
    }

    this.client = axios.create({
      baseURL: this.BASE_URL,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Delfos - Data Assistant',
      },
      timeout: 30000, // 30 segundos
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptors para logging e tratamento de erros
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: any) => {
        this.logger.debug(`OpenRouter API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        this.logger.error('OpenRouter API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: any) => {
        this.logger.debug(`OpenRouter API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: any) => {
        this.logError(error);
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Busca lista de modelos públicos disponíveis
   */
  async getModels(): Promise<OpenRouterModel[]> {
    try {
      this.logger.info('Buscando modelos públicos do OpenRouter...');
      
      const response = await this.client.get('/models');
      
      this.logger.info(`${response.data.data.length} modelos encontrados no OpenRouter`);
      
      return response.data.data;
    } catch (error) {
      this.logger.error('Erro ao buscar modelos do OpenRouter:', error);
      throw error;
    }
  }

  /**
   * Busca informações de um modelo específico
   */
  async getModel(modelId: string): Promise<OpenRouterModel | null> {
    try {
      this.logger.info(`Buscando modelo ${modelId} no OpenRouter...`);
      
      const response = await this.client.get(`/models/${modelId}`);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.logger.warn(`Modelo ${modelId} não encontrado no OpenRouter`);
        return null;
      }
      
      this.logger.error(`Erro ao buscar modelo ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Trata erros da API do OpenRouter
   */
  private handleError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          return new Error('API Key do OpenRouter inválida ou expirada');
        case 403:
          return new Error('Acesso negado pela API do OpenRouter');
        case 429:
          return new Error('Limite de requisições excedido no OpenRouter. Tente novamente mais tarde.');
        case 500:
        case 502:
        case 503:
        case 504:
          return new Error('OpenRouter está temporariamente indisponível. Tente novamente mais tarde.');
        default:
          return new Error(
            data?.error?.message || 
            `Erro ao comunicar com OpenRouter: ${status}`
          );
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('Timeout ao conectar com OpenRouter');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new Error('Não foi possível conectar ao OpenRouter. Verifique sua conexão com a internet.');
    }

    return new Error(error.message || 'Erro desconhecido ao comunicar com OpenRouter');
  }

  /**
   * Registra detalhes do erro no log
   */
  private logError(error: any): void {
    if (error.response) {
      this.logger.error('OpenRouter API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      this.logger.error('OpenRouter Network Error:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
      });
    } else {
      this.logger.error('OpenRouter Client Error:', {
        message: error.message,
      });
    }
  }

  /**
   * Verifica se a API está acessível
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/models', {
        timeout: 5000,
        params: { limit: 1 },
      });
      return true;
    } catch (error) {
      this.logger.warn('OpenRouter health check falhou:', error);
      return false;
    }
  }
}
