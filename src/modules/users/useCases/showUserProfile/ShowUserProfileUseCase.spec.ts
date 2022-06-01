import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Show User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to get user profile infos', async () => {
    const user: User  = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'john',
    });

    const { id } = user;

    const profile = await showUserProfileUseCase.execute(id!);

    expect(profile).toEqual(user);
  })

  it('should not be able to show user profile if id not exists', async () => {
    expect(async () => {
      const id = 'test';

      await showUserProfileUseCase.execute(id);

    }).rejects.toBeInstanceOf(AppError);
  })
});
