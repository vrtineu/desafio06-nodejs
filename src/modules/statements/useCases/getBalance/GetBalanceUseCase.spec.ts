import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get Balance', () => {
  const user = {
    name: 'John Doe',
    email: 'john@doe.com',
    password: 'john',
  }

  const depositMock = {
    type: OperationType.DEPOSIT,
    amount: 100,
    description: 'Deposit of 100',
  }

  const withdrawMock = {
    type: OperationType.WITHDRAW,
    amount: 50,
    description: 'Withdraw of 50',
  }

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it('should be able to get the balance of the user', async () => {
    const userCreated = await createUserUseCase.execute(user);

    const deposit = await createStatementUseCase.execute({
      ...depositMock,
      user_id: userCreated.id!,
    });

    expect(deposit).toHaveProperty('id');
    expect(deposit.amount).toBe(100);
    expect(deposit.type).toBe(OperationType.DEPOSIT);

    const withdraw = await createStatementUseCase.execute({
      ...withdrawMock,
      user_id: userCreated.id!,
    });

    expect(withdraw).toHaveProperty('id');
    expect(withdraw.amount).toBe(50);
    expect(withdraw.type).toBe(OperationType.WITHDRAW);

    const result = await getBalanceUseCase.execute({
      user_id: userCreated.id!,
    });

    expect(result).toHaveProperty('balance');
    expect(result.balance).toBe(50);
    expect(result.statement).toHaveLength(2);
  })

  it('should not be able to get the balance of the user if the user does not exist', async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'non-existing-user-id',
      });
    }).rejects.toBeInstanceOf(AppError);
  })
})
