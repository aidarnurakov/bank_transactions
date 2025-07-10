import { Controller, Post, Body, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PersonService } from '../person/person.service';
import { JobQueueService } from '../job-queue/job-queue.service';
import { TransactionStatus } from './transaction.entity';
import { TransactionCreateManyDto } from './transaction-create-many.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly txService: TransactionService,
    private readonly personService: PersonService,
    private readonly jobQueue: JobQueueService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create multiple transactions' })
  @ApiBody({
    type: TransactionCreateManyDto,
    examples: {
      default: {
        value: {
          transactions: [
            { personId: 1, amount: '100.00' },
            { personId: 2, amount: '50.00' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transactions created',
    type: [TransactionResponseDto],
  })
  async createMany(
    @Body() body: TransactionCreateManyDto,
  ): Promise<{ id: number; status: string }[]> {
    const results: { id: number; status: TransactionStatus }[] = [];
    for (const t of body.transactions) {
      const person = await this.personService.getById(t.personId);
      if (!person) {
        results.push({ id: t.personId, status: 'Failed' });
        continue;
      }
      const tx = await this.txService.create(person, t.amount, 'Pending');
      this.jobQueue.addJob({
        txId: tx.id,
        personId: person.id,
        amount: t.amount,
      });
      results.push({ id: tx.id, status: 'Pending' });
    }
    return results;
  }

  @Get()
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiResponse({
    status: 200,
    description: 'List of recent transactions',
    type: [TransactionResponseDto],
  })
  async getRecent(): Promise<TransactionResponseDto[]> {
    return this.txService.getRecent();
  }
}
