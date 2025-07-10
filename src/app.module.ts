import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './bank/bank.entity';
import { Person } from './person/person.entity';
import { Transaction } from './transaction/transaction.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BankService } from './bank/bank.service';
import { PersonService } from './person/person.service';
import { TransactionService } from './transaction/transaction.service';
import { JobQueueService } from './job-queue/job-queue.service';
import { TransactionsController } from './transaction/transactions.controller';
import { BankController } from './bank/bank.controller';
import { PersonsController } from './person/persons.controller';
import { Seeder } from './seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'test',
      entities: [Bank, Person, Transaction],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Bank, Person, Transaction]),
  ],
  controllers: [
    AppController,
    TransactionsController,
    BankController,
    PersonsController,
  ],
  providers: [
    AppService,
    BankService,
    PersonService,
    TransactionService,
    JobQueueService,
    Seeder,
  ],
})
export class AppModule {}
