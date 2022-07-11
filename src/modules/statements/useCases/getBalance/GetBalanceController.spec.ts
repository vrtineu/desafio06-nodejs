import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection;

const baseUrl = '/api/v1/statements/balance';

const user = {
  email: 'test@test.com',
  password: 'test',
  name: 'test'
};

describe('Get Balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get the balance of the user', async () => {
    const authenticateUser = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    await request(app)
      .post('/api/v1/statements/deposit')
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` })
      .send({
        amount: 100,
        description: 'test deposit',
      });

    const response = await request(app)
      .get(baseUrl)
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statement');
    expect(response.body.balance).toBe(100);
  });
});
