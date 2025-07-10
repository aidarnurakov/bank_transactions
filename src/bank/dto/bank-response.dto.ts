import { ApiProperty } from '@nestjs/swagger';

export class BankResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '10150.00' })
  balance: string;
}
