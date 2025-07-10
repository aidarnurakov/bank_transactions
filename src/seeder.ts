import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './bank/bank.entity';
import { Person } from './person/person.entity';

@Injectable()
export class Seeder implements OnModuleInit {
  constructor(
    @InjectRepository(Bank) private readonly bankRepo: Repository<Bank>,
    @InjectRepository(Person) private readonly personRepo: Repository<Person>,
  ) {}

  async onModuleInit() {
    const bankCount = await this.bankRepo.count();
    if (bankCount === 0) {
      await this.bankRepo.save(this.bankRepo.create({ balance: '10000.00' }));
    }
    const personCount = await this.personRepo.count();
    if (personCount === 0) {
      await this.personRepo.save([
        this.personRepo.create({ name: 'Alice', balance: '1000.00' }),
        this.personRepo.create({ name: 'Bob', balance: '500.00' }),
        this.personRepo.create({ name: 'Charlie', balance: '200.00' }),
      ]);
    }
  }
}
