import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';
import { OperationType } from '../../entities/Statement';

let connection: Connection

const baseUrl = '/api/v1/statements/transfer';

const user = {
  email: 'test@test.com',
  password: 'test',
  name: 'test'
};

describe('Create Transfer Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(user);
    await request(app).post('/api/v1/users').send({
      ...user,
      email: 'uvsi@hujosfoz.gt'
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should create a new transfer statement', async () => {
    const getReceiverId = await request(app).post('/api/v1/sessions').send({
      email: 'uvsi@hujosfoz.gt',
      password: user.password
    });

    const authenticateUserSender = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
      });

    await request(app)
      .post('/api/v1/statements/deposit')
      .set({ Authorization: `Bearer ${authenticateUserSender.body.token}` })
      .send({
        amount: 100,
        description: 'test deposit',
      });

    const { status, body } = await request(app)
      .post(`${baseUrl}/${getReceiverId.body.user.id}`)
      .set({ Authorization: `Bearer ${authenticateUserSender.body.token}` })
      .send({
        amount: 1,
        description: 'test transfer',
      });

    expect(status).toBe(201);
    expect(body.type).toEqual(OperationType.TRANSFER);
    expect(body.amount).toEqual(1);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('user_id');
  });

});
