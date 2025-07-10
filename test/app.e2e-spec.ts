import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

type Person = { id: number; name: string; balance: string };
type Bank = { id: number; balance: string };
type Transaction = {
  id: number;
  person: Person;
  amount: string;
  status: 'Pending' | 'Success' | 'Failed';
  processedAt: string | null;
  createdAt: string;
};

describe('Bank/Transaction API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 500)); // wait for job queue
    await app.close();
  });

  it('GET /bank returns bank balance (smoke test)', async () => {
    const res = await request(app.getHttpServer()).get('/bank');
    const bank = res.body as Bank;
    expect(res.status).toBe(200);
    expect(bank).toHaveProperty('balance');
    expect(typeof bank.balance).toBe('string');
  });

  it('GET /persons returns all persons with balances', async () => {
    const res = await request(app.getHttpServer()).get('/persons');
    const persons = res.body as Person[];
    expect(res.status).toBe(200);
    expect(persons.length).toBeGreaterThanOrEqual(3);
    expect(persons[0]).toHaveProperty('name');
    expect(persons[0]).toHaveProperty('balance');
  });

  it('POST /transactions processes valid and invalid transactions (delta check)', async () => {
    // Get initial state
    const bankStart = (await request(app.getHttpServer()).get('/bank'))
      .body as Bank;
    const personsStart = (await request(app.getHttpServer()).get('/persons'))
      .body as Person[];
    const alice = personsStart.find((p) => p.name === 'Alice')!;
    const bob = personsStart.find((p) => p.name === 'Bob')!;
    const charlie = personsStart.find((p) => p.name === 'Charlie')!;
    const aliceStart = { ...alice };
    const bobStart = { ...bob };
    const charlieStart = { ...charlie };

    // Alice has X, Bob has Y, Charlie has Z
    // Alice sends 100, Bob tries to send 1000 (should fail), Charlie sends 50
    const txRes = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        transactions: [
          { personId: alice.id, amount: '100.00' },
          { personId: bob.id, amount: '1000.00' },
          { personId: charlie.id, amount: '50.00' },
        ],
      });
    const txBody = txRes.body as { id: number; status: string }[];
    expect(txRes.status).toBe(201);
    expect(txBody.length).toBe(3);
    txBody.forEach((t) => expect(t.status).toBe('Pending'));

    // Wait for queue to process
    await new Promise((r) => setTimeout(r, 500));

    // Check transactions status
    const txListRes = await request(app.getHttpServer()).get('/transactions');
    const txList = txListRes.body as Transaction[];
    const aliceTx = txList.find(
      (t) => t.person.id === alice.id && t.amount === '100.00',
    );
    const bobTx = txList.find(
      (t) => t.person.id === bob.id && t.amount === '1000.00',
    );
    const charlieTx = txList.find(
      (t) => t.person.id === charlie.id && t.amount === '50.00',
    );
    expect(aliceTx?.status).toBe('Success');
    expect(charlieTx?.status).toBe('Success');
    expect(bobTx?.status).toBe('Failed');
    expect(aliceTx).toHaveProperty('processedAt');
    expect(charlieTx).toHaveProperty('processedAt');
    expect(bobTx?.processedAt).toBeNull();

    // Check balances after
    const personsAfter = (await request(app.getHttpServer()).get('/persons'))
      .body as Person[];
    const aliceAfter = personsAfter.find((p) => p.id === alice.id)!;
    const bobAfter = personsAfter.find((p) => p.id === bob.id)!;
    const charlieAfter = personsAfter.find((p) => p.id === charlie.id)!;
    const bankAfter = (await request(app.getHttpServer()).get('/bank'))
      .body as Bank;

    // Delta checks
    expect(Number(aliceStart.balance) - Number(aliceAfter.balance)).toBe(100);
    expect(Number(bobStart.balance) - Number(bobAfter.balance)).toBe(0);
    expect(Number(charlieStart.balance) - Number(charlieAfter.balance)).toBe(
      50,
    );
    expect(Number(bankAfter.balance) - Number(bankStart.balance)).toBe(150);
  });
});
