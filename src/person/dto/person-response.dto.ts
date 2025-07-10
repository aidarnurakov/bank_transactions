import { ApiProperty } from '@nestjs/swagger';

export class PersonResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Alice' })
  name: string;

  @ApiProperty({ example: '900.00' })
  balance: string;
} 