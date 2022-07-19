import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createTransferStatementUseCase: CreateTransferStatementUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Create Transfer Use Case', () => {
  const userMock = {
    name: 'John Doe',
    email: 'john@doe.com',
    password: 'john',
  };

  const depositMock = {
    type: OperationType.DEPOSIT,
    amount: 100,
    description: 'Deposit of 100',
  };

  const transferMock = {
    amount: 50,
    description: 'test transfer',
    receiver_id: '12331233',
    sender_id: '123'
  };

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createTransferStatementUseCase = new CreateTransferStatementUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a transfer statement", async () => {
    const userSender = await createUserUseCase.execute(userMock);
    const userReceiver = await createUserUseCase.execute({
      ...userMock,
      email: 'vum@velakilo.na'
    });

    await createStatementUseCase.execute({
      ...depositMock,
      user_id: userSender.id!
    });

    const transferOperation = await createTransferStatementUseCase.execute({
      amount: 50,
      description: 'test transfer',
      receiver_id: userReceiver.id!,
      sender_id: userSender.id!
    });

    expect(transferOperation).toHaveProperty('id');
    expect(transferOperation).toHaveProperty('amount');
    expect(transferOperation).toHaveProperty('description');
    expect(transferOperation).toHaveProperty('type');
    expect(transferOperation).toHaveProperty('user_id');
    expect(transferOperation).toHaveProperty('sender_id');
    expect(transferOperation.type).toEqual(OperationType.TRANSFER);
    expect(transferOperation.amount).toBe(50);
  });

  it('should not be able to create a transfer if sender/receiver not exists', async () => {
    await expect(
      createTransferStatementUseCase.execute(transferMock)
    ).rejects.toEqual(new CreateStatementError.UserNotFound())

    const userSender = await createUserUseCase.execute(userMock);

    await expect(
      createTransferStatementUseCase.execute({
        ...transferMock,
        sender_id: userSender.id!
      })
    ).rejects.toEqual(new CreateStatementError.ReceiverNotFound());
  });

  it('should not be able to create a transfer with insufficient funds', async () => {
    const userSender = await createUserUseCase.execute(userMock);
    const userReceiver = await createUserUseCase.execute({
      ...userMock,
      email: 'vum@velakilo.na'
    });

    await expect(
      createTransferStatementUseCase.execute({
        ...transferMock,
        receiver_id: userReceiver.id!,
        sender_id: userSender.id!
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });

  it('should not be able to create a transfer statement with invalid value', async () => {
    const userSender = await createUserUseCase.execute(userMock);
    const userReceiver = await createUserUseCase.execute({
      ...userMock,
      email: 'vum@velakilo.na'
    });

    await createStatementUseCase.execute({
      ...depositMock,
      user_id: userSender.id!
    });

    await expect(
      createTransferStatementUseCase.execute({
        ...transferMock,
        amount: 0,
        receiver_id: userReceiver.id!,
        sender_id: userSender.id!
      })
    ).rejects.toEqual(new CreateStatementError.InvalidOperation());
  });
})
