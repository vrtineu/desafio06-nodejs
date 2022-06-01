import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create Statement', () => {
  const user = {
    name: 'John Doe',
    email: 'john@doe.com',
    password: 'john',
  }

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  const depositType = 'deposit' as OperationType;
  const withdrawType = 'withdraw' as OperationType;

  const depositMock = {
    type: depositType,
    amount: 100,
    description: 'Deposit of 100',
  }

  const withdrawMock = {
    type: withdrawType,
    amount: 50,
    description: 'Withdraw of 50',
  }

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('should be able to create a deposit and withdraw statement', async () => {
    const userCreated = await createUserUseCase.execute(user);

    const deposit = await createStatementUseCase.execute({
      ...depositMock,
      user_id: userCreated.id!,
    });

    expect(deposit).toHaveProperty('id');
    expect(deposit.amount).toBe(100);
    expect(deposit.type).toBe(depositType);

    const withdraw = await createStatementUseCase.execute({
      ...withdrawMock,
      user_id: userCreated.id!,
    });

    expect(withdraw).toHaveProperty('id');
    expect(withdraw.amount).toBe(50);
    expect(withdraw.type).toBe(withdrawType);
  })

  it('should not be able to create a statement with an invalid user id', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        ...depositMock,
        user_id: 'invalid-id',
      });
    }).rejects.toBeInstanceOf(AppError);

    expect(async () => {
      await createStatementUseCase.execute({
        ...withdrawMock,
        user_id: 'invalid-id',
      });
    }).rejects.toBeInstanceOf(AppError);
  })

  it('should not be able to create a withdraw statement widt insufficient funds', async () => {
    const userCreated = await createUserUseCase.execute(user);

    const deposit = await createStatementUseCase.execute({
      ...depositMock,
      user_id: userCreated.id!,
    });

    expect(deposit).toHaveProperty('id');
    expect(deposit.amount).toBe(100);
    expect(deposit.type).toBe(depositType);

    expect(async () => {
      await createStatementUseCase.execute({
        ...withdrawMock,
        user_id: userCreated.id!,
        amount: 200,
      });
    }).rejects.toBeInstanceOf(AppError);
  })
})
