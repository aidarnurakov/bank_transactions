import { IsArray, ValidateNested, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class TransactionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  personId: number;

  @ApiProperty({ example: '100.00' })
  @IsString()
  amount: string;
}

export class TransactionCreateManyDto {
  @ApiProperty({
    type: [TransactionDto],
    example: [{ personId: 1, amount: '100.00' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];
}
