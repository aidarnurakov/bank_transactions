import { Controller, Post, Body, Get } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PersonService } from '../person/person.service';
import { JobQueueService } from '../job-queue/job-queue.service';
import { TransactionStatus } from './transaction.entity';
import { TransactionCreateManyDto } from './transaction-create-many.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly txService: TransactionService,
    private readonly personService: PersonService,
    private readonly jobQueue: JobQueueService,
  ) {}

  @Post()
  async createMany(
    @Body() body: TransactionCreateManyDto,
  ) {
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
  async getRecent() {
    return this.txService.getRecent();
  }
}
