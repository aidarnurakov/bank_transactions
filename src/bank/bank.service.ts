import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './bank.entity';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepo: Repository<Bank>,
  ) {}

  async getBank(): Promise<Bank> {
    const bank = await this.bankRepo.findOne({ where: {} });
    if (!bank) {
      throw new NotFoundException('Bank not found');
    }
    return bank;
  }

  async updateBalance(amount: string): Promise<Bank> {
    const bank = await this.getBank();
    if (!bank) {
      throw new NotFoundException('Bank not found');
    }
    bank.balance = (parseFloat(bank.balance) + parseFloat(amount)).toFixed(2);
    return await this.bankRepo.save(bank);
  }
}
