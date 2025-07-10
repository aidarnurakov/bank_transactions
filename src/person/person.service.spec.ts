import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Person } from './person.entity';
import { NotFoundException } from '@nestjs/common';

describe('PersonService', () => {
  let service: PersonService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        { provide: getRepositoryToken(Person), useValue: repo },
      ],
    }).compile();
    service = module.get(PersonService);
  });

  it('getAll returns all persons', async () => {
    repo.find.mockResolvedValue([{ id: 1, name: 'A', balance: '10.00' }]);
    const res = await service.getAll();
    expect(res).toEqual([{ id: 1, name: 'A', balance: '10.00' }]);
  });

  it('getById returns person if found', async () => {
    repo.findOne.mockResolvedValue({ id: 2, name: 'B', balance: '20.00' });
    const res = await service.getById(2);
    expect(res).toEqual({ id: 2, name: 'B', balance: '20.00' });
  });

  it('getById returns null if not found', async () => {
    repo.findOne.mockResolvedValue(null);
    const res = await service.getById(99);
    expect(res).toBeNull();
  });

  it('updateBalance increases balance', async () => {
    repo.findOne.mockResolvedValue({ id: 1, name: 'A', balance: '10.00' });
    repo.save.mockImplementation((p) => p);
    const res = await service.updateBalance(1, '5.00');
    expect(res.balance).toBe('15.00');
  });

  it('updateBalance decreases balance', async () => {
    repo.findOne.mockResolvedValue({ id: 1, name: 'A', balance: '10.00' });
    repo.save.mockImplementation((p) => p);
    const res = await service.updateBalance(1, '-3.00');
    expect(res.balance).toBe('7.00');
  });

  it('updateBalance throws if person not found', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.updateBalance(1, '1.00')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
