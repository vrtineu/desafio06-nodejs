import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection

const baseUrl = '/api/v1/sessions';

const user = {
  email: 'test@test.com',
  password: 'test',
  name: 'test'
};

describe('Sessions', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate user', async () => {
    const response = await request(app).post(baseUrl).send({
      email: user.email,
      password: user.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate user with incorrect email', async () => {
    const response = await request(app).post(baseUrl).send({
      email: 'invalid@test.com',
      password: user.password,
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Incorrect email or password' });
  });

  it('should not be able to authenticate user with incorrect password', async () => {
    const response = await request(app).post(baseUrl).send({
      email: user.email,
      password: 'wrongPassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Incorrect email or password' });
  });
});
