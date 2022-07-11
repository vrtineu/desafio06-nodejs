import request from 'supertest'
import { Connection, createConnection } from 'typeorm'
import { app } from '../../../../app';

let connection: Connection

const baseUrl = '/api/v1/profile';

const user = {
  email: 'test@test.com',
  password: 'test',
  name: 'test'
};

describe('Show user profile controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to get a user profile infos', async () => {
    const authenticateUser = await request(app).post('/api/v1/sessions').send({
      email: user.email,
      password: user.password
    });

    const response = await request(app)
      .get(baseUrl)
      .set({ Authorization: `Bearer ${authenticateUser.body.token}` })

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });
});
