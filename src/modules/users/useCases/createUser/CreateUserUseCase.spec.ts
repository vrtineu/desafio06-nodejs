import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'john',
    });

    expect(user).toHaveProperty('id');
  })

  it('should not be able to create a new user if email already exists', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'john',
      });

      await createUserUseCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'john',
      });
    }).rejects.toBeInstanceOf(AppError)
  })
})
