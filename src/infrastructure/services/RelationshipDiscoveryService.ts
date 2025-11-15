import { TableInfo } from '../../domain/entities/SchemaSnapshot';
import { IDataSourceRepository } from '../../domain/interfaces/IDataSourceRepository';
import { ISchemaSnapshotRepository } from '../../domain/interfaces/ISchemaSnapshotRepository';

export interface RelationshipCandidate {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  sourceDataSourceId: string;
  targetDataSourceId: string;
  confidence: number;
  reasons: string[];
}

export interface TableColumnInfo {
  table: string;
  column: string;
  type: string;
  nullable: boolean;
  sampleValues: any[];
  dataSourceId: string;
}

export class RelationshipDiscoveryService {
  constructor(
    private dataSourceRepository: IDataSourceRepository,
    private schemaSnapshotRepository: ISchemaSnapshotRepository
  ) {}

  /**
   * Descobre relacionamentos entre todas as fontes de dados de uma coleção
   */
  async discoverRelationships(collectionId: string): Promise<RelationshipCandidate[]> {
    // Obter todas as fontes de dados da coleção
    const dataSources = await this.dataSourceRepository.getByCollectionId(collectionId);
    
    if (dataSources.length < 2) {
      return []; // Precisa de pelo menos 2 fontes para relacionar
    }

    // Obter snapshots mais recentes de cada fonte
    const tableColumns: TableColumnInfo[] = [];
    
    for (const dataSource of dataSources) {
      const snapshot = await this.schemaSnapshotRepository.getLatestByDataSourceId(dataSource.id);
      if (!snapshot || !snapshot.tables) {
        continue;
      }

      // Extrair informações de todas as colunas de todas as tabelas
      for (const table of snapshot.tables) {
        for (const column of table.columns) {
          // Obter amostras de valores da coluna
          const sampleValues = this.extractColumnSampleValues(table, column.name);
          
          tableColumns.push({
            table: table.name,
            column: column.name,
            type: column.type,
            nullable: column.nullable,
            sampleValues,
            dataSourceId: dataSource.id,
          });
        }
      }
    }

    // Comparar todas as colunas entre si
    const candidates: RelationshipCandidate[] = [];

    for (let i = 0; i < tableColumns.length; i++) {
      for (let j = i + 1; j < tableColumns.length; j++) {
        const source = tableColumns[i];
        const target = tableColumns[j];

        // Não relacionar colunas da mesma tabela ou mesma fonte
        if (source.table === target.table || source.dataSourceId === target.dataSourceId) {
          continue;
        }

        const candidate = this.evaluateRelationship(source, target);
        if (candidate && candidate.confidence > 0.3) { // Threshold mínimo de confiança
          candidates.push(candidate);
        }
      }
    }

    // Ordenar por confiança (maior primeiro)
    return candidates.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Avalia se duas colunas podem estar relacionadas
   */
  private evaluateRelationship(
    source: TableColumnInfo,
    target: TableColumnInfo
  ): RelationshipCandidate | null {
    const reasons: string[] = [];
    let confidence = 0;

    // Heurística 1: Nome similar (fuzzy matching)
    const nameSimilarity = this.calculateNameSimilarity(source.column, target.column);
    if (nameSimilarity > 0.6) {
      confidence += nameSimilarity * 0.4; // Peso 40%
      reasons.push(`Nomes similares (${(nameSimilarity * 100).toFixed(0)}%)`);
    }

    // Heurística 2: Tipo compatível
    const typeCompatibility = this.checkTypeCompatibility(source.type, target.type);
    if (typeCompatibility > 0) {
      confidence += typeCompatibility * 0.3; // Peso 30%
      reasons.push('Tipos compatíveis');
    }

    // Heurística 3: Amostras de dados sobrepostas
    const sampleOverlap = this.calculateSampleOverlap(source.sampleValues, target.sampleValues);
    if (sampleOverlap > 0) {
      confidence += sampleOverlap * 0.3; // Peso 30%
      reasons.push(`Sobreposição de valores (${(sampleOverlap * 100).toFixed(0)}%)`);
    }

    // Bônus: Padrão de nome comum (ex: *_id, id_*)
    const namePatternBonus = this.checkNamePattern(source.column, target.column);
    if (namePatternBonus > 0) {
      confidence += namePatternBonus * 0.1; // Peso 10%
      reasons.push('Padrão de nome comum (ex: *_id)');
    }

    // Limitar confiança entre 0 e 1
    confidence = Math.min(1, Math.max(0, confidence));

    if (confidence === 0) {
      return null;
    }

    return {
      sourceTable: source.table,
      sourceColumn: source.column,
      targetTable: target.table,
      targetColumn: target.column,
      sourceDataSourceId: source.dataSourceId,
      targetDataSourceId: target.dataSourceId,
      confidence,
      reasons,
    };
  }

  /**
   * Calcula similaridade entre nomes usando algoritmo de Levenshtein simplificado
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const normalized1 = name1.toLowerCase().replace(/[_-]/g, '');
    const normalized2 = name2.toLowerCase().replace(/[_-]/g, '');

    // Verificação exata
    if (normalized1 === normalized2) {
      return 1.0;
    }

    // Verificação de substring
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return 0.8;
    }

    // Verificação de sufixo comum (ex: cliente_id ↔ clientes.id)
    const suffix1 = this.extractSuffix(normalized1);
    const suffix2 = this.extractSuffix(normalized2);
    if (suffix1 && suffix2 && suffix1 === suffix2) {
      return 0.7;
    }

    // Verificação de prefixo comum (ex: id_cliente ↔ id_clientes)
    const prefix1 = this.extractPrefix(normalized1);
    const prefix2 = this.extractPrefix(normalized2);
    if (prefix1 && prefix2 && prefix1 === prefix2) {
      return 0.7;
    }

    // Levenshtein distance simplificado
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Extrai sufixo comum (ex: "id", "code", "key")
   */
  private extractSuffix(name: string): string | null {
    const commonSuffixes = ['id', 'code', 'key', 'pk', 'fk'];
    for (const suffix of commonSuffixes) {
      if (name.endsWith(suffix)) {
        return suffix;
      }
    }
    return null;
  }

  /**
   * Extrai prefixo comum (ex: "id", "code", "key")
   */
  private extractPrefix(name: string): string | null {
    const commonPrefixes = ['id', 'code', 'key', 'pk', 'fk'];
    for (const prefix of commonPrefixes) {
      if (name.startsWith(prefix)) {
        return prefix;
      }
    }
    return null;
  }

  /**
   * Calcula distância de Levenshtein entre duas strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Verifica compatibilidade de tipos
   */
  private checkTypeCompatibility(type1: string, type2: string): number {
    const normalized1 = type1.toLowerCase().split('(')[0].trim();
    const normalized2 = type2.toLowerCase().split('(')[0].trim();

    // Tipos exatamente iguais
    if (normalized1 === normalized2) {
      return 1.0;
    }

    // Grupos de tipos compatíveis
    const typeGroups: Record<string, string[]> = {
      integer: ['int', 'integer', 'bigint', 'smallint', 'serial', 'bigserial'],
      decimal: ['decimal', 'numeric', 'float', 'double', 'real', 'money'],
      string: ['varchar', 'char', 'text', 'string'],
      date: ['date', 'timestamp', 'datetime', 'time'],
      boolean: ['boolean', 'bool', 'bit'],
    };

    for (const [_group, types] of Object.entries(typeGroups)) {
      if (types.includes(normalized1) && types.includes(normalized2)) {
        return 0.8;
      }
    }

    // Tipos numéricos são compatíveis entre si
    const numericTypes = ['int', 'integer', 'bigint', 'smallint', 'decimal', 'numeric', 'float', 'double', 'real'];
    if (numericTypes.includes(normalized1) && numericTypes.includes(normalized2)) {
      return 0.6;
    }

    return 0;
  }

  /**
   * Calcula sobreposição de valores de amostra
   */
  private calculateSampleOverlap(samples1: any[], samples2: any[]): number {
    if (samples1.length === 0 || samples2.length === 0) {
      return 0;
    }

    // Normalizar valores (converter para string para comparação)
    const set1 = new Set(samples1.map(v => String(v).toLowerCase().trim()).filter(v => v));
    const set2 = new Set(samples2.map(v => String(v).toLowerCase().trim()).filter(v => v));

    if (set1.size === 0 || set2.size === 0) {
      return 0;
    }

    // Calcular interseção
    let intersection = 0;
    for (const value of set1) {
      if (set2.has(value)) {
        intersection++;
      }
    }

    // Calcular união
    const union = new Set([...set1, ...set2]).size;

    // Jaccard similarity
    return union > 0 ? intersection / union : 0;
  }

  /**
   * Verifica padrões comuns de nome (ex: *_id, id_*)
   */
  private checkNamePattern(name1: string, name2: string): number {
    const normalized1 = name1.toLowerCase();
    const normalized2 = name2.toLowerCase();

    // Padrão: *_id
    if ((normalized1.endsWith('_id') || normalized1.endsWith('id')) &&
        (normalized2.endsWith('_id') || normalized2.endsWith('id'))) {
      return 0.5;
    }

    // Padrão: id_*
    if ((normalized1.startsWith('id_') || normalized1.startsWith('id')) &&
        (normalized2.startsWith('id_') || normalized2.startsWith('id'))) {
      return 0.5;
    }

    return 0;
  }

  /**
   * Extrai valores de amostra de uma coluna específica
   */
  private extractColumnSampleValues(table: TableInfo, columnName: string): any[] {
    const values: any[] = [];

    for (const row of table.sampleRows || []) {
      if (row[columnName] !== undefined && row[columnName] !== null) {
        values.push(row[columnName]);
      }
    }

    return values;
  }
}

