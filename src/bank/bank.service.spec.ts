import { Test, TestingModule } from '@nestjs/testing';
import { BankService } from './bank.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bank } from './bank.entity';
import { NotFoundException } from '@nestjs/common';

describe('BankService', () => {
  let service: BankService;
  let repo: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        { provide: getRepositoryToken(Bank), useValue: repo },
      ],
    }).compile();
    service = module.get(BankService);
  });

  it('getBank returns bank if exists', async () => {
    repo.findOne.mockResolvedValue({ id: 1, balance: '100.00' });
    const bank = await service.getBank();
    expect(bank).toEqual({ id: 1, balance: '100.00' });
  });

  it('getBank throws if not found', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.getBank()).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateBalance increases balance', async () => {
    repo.findOne.mockResolvedValue({ id: 1, balance: '100.00' });
    repo.save.mockImplementation((b: Bank) => Promise.resolve(b));
    const bank = await service.updateBalance('50.00');
    expect(bank.balance).toBe('150.00');
  });

  it('updateBalance decreases balance', async () => {
    repo.findOne.mockResolvedValue({ id: 1, balance: '100.00' });
    repo.save.mockImplementation((b: Bank) => Promise.resolve(b));
    const bank = await service.updateBalance('-30.00');
    expect(bank.balance).toBe('70.00');
  });
});
