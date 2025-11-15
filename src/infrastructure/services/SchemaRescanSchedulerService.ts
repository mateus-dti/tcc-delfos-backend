import * as cron from 'node-cron';
import { ExtractSchemaCommandHandler } from '../../application/commands/datasources/ExtractSchemaCommandHandler';
import { createLogger } from '../config/logger';

export interface RescanSchedule {
  id: string;
  dataSourceId: string;
  ownerId: string;
  cronExpression: string;
  enabled: boolean;
  description?: string;
}

export class SchemaRescanSchedulerService {
  private schedules: Map<string, cron.ScheduledTask> = new Map();
  private scheduleConfigs: Map<string, RescanSchedule> = new Map();
  private logger = createLogger();

  constructor(
    private extractSchemaHandler: ExtractSchemaCommandHandler
  ) {}

  /**
   * Agenda uma reextração periódica de schema
   */
  scheduleRescan(schedule: RescanSchedule): void {
    // Validar expressão cron
    if (!cron.validate(schedule.cronExpression)) {
      throw new Error(`Expressão cron inválida: ${schedule.cronExpression}`);
    }

    // Remover agendamento existente se houver
    this.unscheduleRescan(schedule.id);

    // Criar tarefa agendada
    const task = cron.schedule(
      schedule.cronExpression,
      async () => {
        try {
          this.logger.info(`Executando reextração agendada para fonte de dados: ${schedule.dataSourceId}`);
          
          await this.extractSchemaHandler.handle({
            dataSourceId: schedule.dataSourceId,
            ownerId: schedule.ownerId,
          });

          this.logger.info(`Reextração agendada concluída para fonte de dados: ${schedule.dataSourceId}`);
        } catch (error) {
          this.logger.error(
            `Erro ao executar reextração agendada para fonte de dados ${schedule.dataSourceId}:`,
            error
          );
        }
      }
    );

    // Iniciar ou parar a tarefa baseado no status enabled
    if (!schedule.enabled) {
      task.stop();
    }

    this.schedules.set(schedule.id, task);
    this.scheduleConfigs.set(schedule.id, schedule);

    this.logger.info(
      `Agendamento criado: ${schedule.id} para fonte de dados ${schedule.dataSourceId} com expressão ${schedule.cronExpression}`
    );
  }

  /**
   * Remove um agendamento
   */
  unscheduleRescan(scheduleId: string): void {
    const task = this.schedules.get(scheduleId);
    if (task) {
      task.stop();
      task.destroy();
      this.schedules.delete(scheduleId);
      this.scheduleConfigs.delete(scheduleId);
      this.logger.info(`Agendamento removido: ${scheduleId}`);
    }
  }

  /**
   * Atualiza um agendamento existente
   */
  updateSchedule(schedule: RescanSchedule): void {
    this.scheduleRescan(schedule);
  }

  /**
   * Habilita ou desabilita um agendamento
   */
  toggleSchedule(scheduleId: string, enabled: boolean): void {
    const schedule = this.scheduleConfigs.get(scheduleId);
    if (!schedule) {
      throw new Error(`Agendamento não encontrado: ${scheduleId}`);
    }

    schedule.enabled = enabled;
    const task = this.schedules.get(scheduleId);
    
    if (task) {
      if (enabled) {
        task.start();
      } else {
        task.stop();
      }
    }

    this.logger.info(`Agendamento ${scheduleId} ${enabled ? 'habilitado' : 'desabilitado'}`);
  }

  /**
   * Lista todos os agendamentos de uma fonte de dados
   */
  getSchedulesByDataSource(dataSourceId: string): RescanSchedule[] {
    return Array.from(this.scheduleConfigs.values()).filter(
      (schedule) => schedule.dataSourceId === dataSourceId
    );
  }

  /**
   * Lista todos os agendamentos
   */
  getAllSchedules(): RescanSchedule[] {
    return Array.from(this.scheduleConfigs.values());
  }

  /**
   * Obtém um agendamento por ID
   */
  getSchedule(scheduleId: string): RescanSchedule | undefined {
    return this.scheduleConfigs.get(scheduleId);
  }

  /**
   * Remove todos os agendamentos de uma fonte de dados
   */
  unscheduleAllByDataSource(dataSourceId: string): void {
    const schedules = this.getSchedulesByDataSource(dataSourceId);
    schedules.forEach((schedule) => {
      this.unscheduleRescan(schedule.id);
    });
  }

  /**
   * Para todos os agendamentos (útil para shutdown)
   */
  stopAll(): void {
    this.schedules.forEach((task) => {
      task.stop();
      task.destroy();
    });
    this.schedules.clear();
    this.scheduleConfigs.clear();
    this.logger.info('Todos os agendamentos foram parados');
  }
}

