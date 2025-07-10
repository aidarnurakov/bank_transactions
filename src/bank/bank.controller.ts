import { Controller, Get } from '@nestjs/common';
import { BankService } from './bank.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BankResponseDto } from './dto/bank-response.dto';

@ApiTags('bank')
@Controller('bank')
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Get()
  @ApiOperation({ summary: 'Get bank balance' })
  @ApiResponse({
    status: 200,
    description: 'Bank balance',
    type: BankResponseDto,
  })
  async getBank(): Promise<BankResponseDto> {
    const result = await this.bankService.getBank();
    return result;
  }
}
