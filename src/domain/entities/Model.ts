import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Enum para origem do modelo de IA
 */
export enum ModelOrigin {
  OpenRouter = 'OpenRouter',
  Internal = 'Internal',
}

/**
 * Entidade Model - Representa um modelo de IA disponível no sistema
 * RF04.1 - Armazena modelos públicos e internos
 */
@Entity('Models')
export class Model {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 500, unique: true })
  identifier!: string; // Ex: "openai/gpt-4", "internal/custom-model"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ModelOrigin,
  })
  origin!: ModelOrigin;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
