import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection

const baseUrl = '/api/v1/statements';

const user = {
  email: 'test@test.com',
  password: 'test',
  name: 'test'
};

describe('Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new deposit statement', async () => {
    const authenticateUser = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const response = await request(app)
      .post(`${baseUrl}/deposit`)
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` })
      .send({
        amount: 100,
        description: 'test deposit',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(response.body.amount).toBe(100);
    expect(response.body.description).toBe('test deposit');
    expect(response.body.type).toBe('deposit');
  });

  it('should be able to create a new withdraw statement', async () => {
    const authenticateUser = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const response = await request(app)
      .post(`${baseUrl}/withdraw`)
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` })
      .send({
        amount: 50,
        description: 'test withdraw',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('user_id');
    expect(response.body).toHaveProperty('amount');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('type');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
    expect(response.body.amount).toBe(50);
    expect(response.body.description).toBe('test withdraw');
    expect(response.body.type).toBe('withdraw');
  });

  it('should not be able to create a new withdraw statement if user has invalid funds', async () => {
    const authenticateUser = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const response = await request(app)
      .post(`${baseUrl}/withdraw`)
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` })
      .send({
        amount: 51,
        description: 'invalid withdraw',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Insufficient funds' });
  });
});
