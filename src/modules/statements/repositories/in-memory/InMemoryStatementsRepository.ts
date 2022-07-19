import { OperationType, Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { ICreateTransferDTO } from "../../useCases/createTransferStatement/ICreateTransferDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  async create({
    amount,
    description,
    type,
    user_id,
    sender_id
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();

    Object.assign(statement, { amount, description, type, user_id, sender_id });

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({
    statement_id,
    user_id
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(operation => (
      operation.id === statement_id &&
      operation.user_id === user_id
    ));
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    > {
    const statement = this.statements.filter(
      operation => operation.user_id === user_id
    );

    const balance = statement.reduce((acc, operation) => {
      const { type } = operation;

      if (type === OperationType.DEPOSIT || type === OperationType.TRANSFER) {
        return acc + operation.amount;
      }

      return acc - operation.amount;
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
