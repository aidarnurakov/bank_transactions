import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';
import { DataSource } from 'typeorm';
import { Person } from '../person/person.entity';
import { Bank } from '../bank/bank.entity';

interface TransactionJob {
  txId: number;
  personId: number;
  amount: string;
}

@Injectable()
export class JobQueueService {
  private queue: TransactionJob[] = [];
  private processing = false;
  private logger = new Logger(JobQueueService.name);

  constructor(
    private readonly txService: TransactionService,
    private readonly dataSource: DataSource,
  ) {}

  addJob(job: TransactionJob) {
    this.queue.push(job);
    void this.processNext();
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const job = this.queue.shift();
    try {
      await this.processJob(job!);
    } catch (e) {
      this.logger.error('Job processing failed', e);
    } finally {
      this.processing = false;
      if (this.queue.length > 0) {
        setTimeout(() => void this.processNext(), 0);
      }
    }
  }

  private async processJob(job: TransactionJob) {
    await this.dataSource.transaction(async (manager) => {
      const person = await manager.findOne(Person, {
        where: { id: job.personId },
      });
      if (!person) {
        throw new NotFoundException('Person not found');
      }
      if (parseFloat(person.balance) < parseFloat(job.amount)) {
        await this.txService.updateStatus(job.txId, 'Failed');
        return;
      }
      person.balance = (
        parseFloat(person.balance) - parseFloat(job.amount)
      ).toFixed(2);
      await manager.save('Person', person);
      const bank = await manager.findOne(Bank, { where: {} });
      if (!bank) {
        throw new NotFoundException('Bank not found');
      }
      bank.balance = (
        parseFloat(bank.balance) + parseFloat(job.amount)
      ).toFixed(2);
      await manager.save(Bank, bank);
      await this.txService.updateStatus(job.txId, 'Success', new Date());
    });
  }
}
