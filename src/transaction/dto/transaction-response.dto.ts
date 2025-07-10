import { ApiProperty } from '@nestjs/swagger';
import { PersonResponseDto } from '../../person/dto/person-response.dto';

export class TransactionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: PersonResponseDto })
  person: PersonResponseDto;

  @ApiProperty({ example: '100.00' })
  amount: string;

  @ApiProperty({ example: 'Success', enum: ['Pending', 'Success', 'Failed'] })
  status: 'Pending' | 'Success' | 'Failed';

  @ApiProperty({ example: '2024-01-01T12:00:00.000Z', nullable: true })
  processedAt: Date | null;

  @ApiProperty({ example: '2024-01-01T11:59:00.000Z' })
  createdAt: Date;
}
