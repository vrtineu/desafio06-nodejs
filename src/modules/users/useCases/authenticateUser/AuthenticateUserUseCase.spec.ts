import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to authenticate user', async () => {
    const userInfos = {
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'john',
    };

    await createUserUseCase.execute(userInfos);

    const authenticate = await authenticateUserUseCase.execute({
      email: userInfos.email,
      password: userInfos.password,
    });

    expect(authenticate).toHaveProperty('token');
    expect(authenticate).toHaveProperty('user');
  });

  it('should not be able to authenticate user with incorrect email', async () => {
    expect(async () => {
      const userInfos = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'john',
      };

      await createUserUseCase.execute(userInfos);

      await authenticateUserUseCase.execute({
        email: 'email@test.com',
        password: userInfos.password,
      });
    }).rejects.toBeInstanceOf(AppError)
  });

  it('should not be able to authenticate user with incorrect password', async () => {
    expect(async () => {
      const userInfos = {
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'john',
      };

      await createUserUseCase.execute(userInfos);

      await authenticateUserUseCase.execute({
        email: userInfos.email,
        password: 'password',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
