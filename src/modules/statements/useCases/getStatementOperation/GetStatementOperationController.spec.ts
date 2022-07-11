import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';
import { v4 as uuidV4 } from 'uuid';

let connection: Connection;

const baseUrl = '/api/v1/statements';

const user = {
  email: 'test@test.com',
  password: 'test',
  name: 'test'
};

describe('Get Statement Operation Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get a specific statement', async () => {
    const authenticateUser = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const depositStatement = await request(app)
      .post('/api/v1/statements/deposit')
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` })
      .send({
        amount: 100,
        description: 'test deposit',
      });

    const response = await request(app)
      .get(`${baseUrl}/${depositStatement.body.id}`)
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  it('should not be able to get a specific statement with invalid id', async () => {
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

    const invalid_id = uuidV4();

    const response = await request(app)
      .get(`${baseUrl}/${invalid_id}`)
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Statement not found' });
  });
});
