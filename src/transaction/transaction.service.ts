import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './transaction.entity';
import { Person } from '../person/person.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async create(
    person: Person,
    amount: string,
    status: TransactionStatus,
  ): Promise<Transaction> {
    const tx = this.txRepo.create({ person, amount, status });
    return this.txRepo.save(tx);
  }

  async updateStatus(
    id: number,
    status: TransactionStatus,
    processedAt?: Date,
  ) {
    await this.txRepo.update(id, { status, processedAt });
  }

  async getRecent(limit = 20): Promise<Transaction[]> {
    return this.txRepo.find({ order: { createdAt: 'DESC' }, take: limit });
  }
}
