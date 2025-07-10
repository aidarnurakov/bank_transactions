import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepo: Repository<Person>,
  ) {}

  async getAll(): Promise<Person[]> {
    return this.personRepo.find();
  }

  async getById(id: number): Promise<Person | null> {
    return this.personRepo.findOne({ where: { id } });
  }

  async updateBalance(id: number, amount: string): Promise<Person> {
    const person = await this.getById(id);
    if (!person) {
      throw new NotFoundException('Person not found');
    }
    person.balance = (parseFloat(person.balance) + parseFloat(amount)).toFixed(
      2,
    );
    return this.personRepo.save(person);
  }
}
