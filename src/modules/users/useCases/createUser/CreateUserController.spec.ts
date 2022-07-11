import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection

const baseUrl = '/api/v1/users';

describe('Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new  user', async () => {
    const response = await request(app).post(baseUrl).send({
      name: 'Ian Cox',
      email: 'ke@rec.cw',
      password: '985583',
    });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a new user if email already exists', async () => {
    const response = await request(app).post(baseUrl).send({
      name: 'Ian Cox',
      email: 'ke@rec.cw',
      password: '985583',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'User already exists' });
  });
});
