import { IsArray, ValidateNested, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class TransactionDto {
  @IsNumber()
  personId: number;

  @IsString()
  amount: string;
}

export class TransactionCreateManyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];
} 