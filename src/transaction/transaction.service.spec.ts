import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Person } from '../person/person.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let repo: {
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: getRepositoryToken(Transaction), useValue: repo },
      ],
    }).compile();
    service = module.get(TransactionService);
  });

  it('create creates and saves transaction', async () => {
    const person: Person = { id: 1, name: 'A', balance: '10.00' };
    const tx = { id: 1, person, amount: '5.00', status: 'Pending' };
    repo.create.mockReturnValue(tx);
    repo.save.mockResolvedValue(tx);
    const res = await service.create(person, '5.00', 'Pending');
    expect(res).toEqual(tx);
    expect(repo.create).toHaveBeenCalledWith({
      person,
      amount: '5.00',
      status: 'Pending',
    });
    expect(repo.save).toHaveBeenCalledWith(tx);
  });

  it('updateStatus updates status and processedAt', async () => {
    await service.updateStatus(1, 'Success', new Date('2024-01-01T00:00:00Z'));
    expect(repo.update).toHaveBeenCalledWith(1, {
      status: 'Success',
      processedAt: new Date('2024-01-01T00:00:00Z'),
    });
  });

  it('getRecent returns recent transactions', async () => {
    const txs = [{ id: 1 }, { id: 2 }];
    repo.find.mockResolvedValue(txs);
    const res = await service.getRecent(2);
    expect(res).toBe(txs);
    expect(repo.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      take: 2,
    });
  });
});
