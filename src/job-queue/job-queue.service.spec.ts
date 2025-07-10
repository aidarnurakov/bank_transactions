import { Test, TestingModule } from '@nestjs/testing';
import { JobQueueService } from './job-queue.service';
import { TransactionService } from '../transaction/transaction.service';
import { PersonService } from '../person/person.service';
import { BankService } from '../bank/bank.service';
import { DataSource } from 'typeorm';

describe('JobQueueService', () => {
  let service: JobQueueService;
  let txService: { updateStatus: jest.Mock };
  let personService: { getById: jest.Mock };
  let bankService: { getBank: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    txService = { updateStatus: jest.fn() };
    personService = { getById: jest.fn() };
    bankService = { getBank: jest.fn() };
    dataSource = { transaction: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobQueueService,
        { provide: TransactionService, useValue: txService },
        { provide: PersonService, useValue: personService },
        { provide: BankService, useValue: bankService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = module.get(JobQueueService);
    // Очистить очередь перед каждым тестом
    (service as any).queue = [];
    (service as any).processing = false;
  });

  it('addJob adds job to queue and triggers processing', () => {
    const spy = jest.spyOn(service as any, 'processNext').mockImplementation(() => {});
    service.addJob({ txId: 1, personId: 2, amount: '10.00' });
    expect((service as any).queue.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('processJob: person not found', async () => {
    dataSource.transaction.mockImplementation(async (cb) => {
      await cb({ findOne: () => null });
    });
    await expect((service as any).processJob({ txId: 1, personId: 2, amount: '10.00' })).rejects.toThrow();
  });

  it('processJob: insufficient funds', async () => {
    dataSource.transaction.mockImplementation(async (cb) => {
      await cb({
        findOne: ({}, opts) => opts.where.id === 2 ? { id: 2, balance: '5.00' } : { id: 1, balance: '100.00' },
        save: jest.fn(),
      });
    });
    txService.updateStatus.mockResolvedValue(undefined);
    await (service as any).processJob({ txId: 1, personId: 2, amount: '10.00' });
    expect(txService.updateStatus).toHaveBeenCalledWith(1, 'Failed');
  });

  it('processJob: bank not found', async () => {
    dataSource.transaction.mockImplementation(async (cb) => {
      await cb({
        findOne: ({}, opts) => opts.where.id === 2 ? { id: 2, balance: '100.00' } : null,
        save: jest.fn(),
      });
    });
    await expect((service as any).processJob({ txId: 1, personId: 2, amount: '10.00' })).rejects.toThrow();
  });

  it('processJob: success', async () => {
    const save = jest.fn();
    dataSource.transaction.mockImplementation(async (cb) => {
      await cb({
        findOne: ({}, opts) => opts.where.id === 2 ? { id: 2, balance: '100.00' } : { id: 1, balance: '1000.00' },
        save,
      });
    });
    txService.updateStatus.mockResolvedValue(undefined);
    await (service as any).processJob({ txId: 1, personId: 2, amount: '10.00' });
    expect(save).toHaveBeenCalledTimes(2);
    expect(txService.updateStatus).toHaveBeenCalledWith(1, 'Success', expect.any(Date));
  });
}); 