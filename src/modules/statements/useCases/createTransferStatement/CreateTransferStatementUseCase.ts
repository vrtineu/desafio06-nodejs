import { inject, injectable } from "tsyringe"
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "../createStatement/CreateStatementError";

interface IRequest {
  amount: number;
  description: string;
  sender_id: string;
  receiver_id: string;
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  public async execute({
    amount,
    description,
    receiver_id,
    sender_id
  }: IRequest): Promise<Statement> {
    const userSender = await this.usersRepository.findById(sender_id);

    if (!userSender) {
      throw new CreateStatementError.UserNotFound();
    }

    const userReceiver = await this.usersRepository.findById(receiver_id);

    if (!userReceiver) {
      throw new CreateStatementError.ReceiverNotFound();
    }

    const { balance: senderBalance } = await this.statementsRepository
      .getUserBalance({ user_id: sender_id });

    if (senderBalance < amount) {
      throw new CreateStatementError.InsufficientFunds();
    }

    const MIN_AMOUNT_VALID = 0.01;

    if (amount < MIN_AMOUNT_VALID) {
      throw new CreateStatementError.InvalidOperation();
    }

    const transferOperation = await this.statementsRepository.create({
      amount,
      description,
      sender_id,
      type: OperationType.TRANSFER,
      user_id: receiver_id
    });

    return transferOperation;
  }
}

export { CreateTransferStatementUseCase }
