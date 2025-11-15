import { IsString, IsNotEmpty, Matches, IsOptional, IsBoolean } from 'class-validator';

export class CreateRescanScheduleRequest {
  // dataSourceId vem da URL, não precisa estar no body
  dataSourceId?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/, {
    message: 'Expressão cron inválida. Use o formato: minuto hora dia mês dia-da-semana (ex: "0 2 * * *" para diário às 2h)',
  })
  cronExpression!: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

