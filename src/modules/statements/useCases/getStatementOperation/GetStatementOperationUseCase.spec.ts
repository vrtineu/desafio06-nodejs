import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get Statement', () => {
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

  const depositMock = {
    type: depositType,
    amount: 100,
    description: 'Deposit of 100',
  }

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to get a specific statement', async () => {
    const userCreated = await createUserUseCase.execute(user);

    const deposit = await createStatementUseCase.execute({
      ...depositMock,
      user_id: userCreated.id!,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: userCreated.id!,
      statement_id: deposit.id!,
    });

    expect(result).toBeInstanceOf(Statement);
    expect(result).toHaveProperty('id');
    expect(result.amount).toBe(100);
    expect(result.type).toBe(depositType);
  })

  it('should not be able to get a specific statement if the user does not exist', async () => {
    const userCreated = await createUserUseCase.execute(user);

    const deposit = await createStatementUseCase.execute({
      ...depositMock,
      user_id: userCreated.id!,
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: 'invalid_id',
        statement_id: deposit.id!,
      })
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to get a specific statement if the statement does not exist', async () => {
    const userCreated = await createUserUseCase.execute(user);

    await createStatementUseCase.execute({
      ...depositMock,
      user_id: userCreated.id!,
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: userCreated.id!,
        statement_id: 'invalid_id',
      })
    }).rejects.toBeInstanceOf(AppError)
  })
})
