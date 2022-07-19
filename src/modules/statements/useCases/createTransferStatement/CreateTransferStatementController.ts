import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

class CreateTransferStatementController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { receiver_id } = request.params;
    const { id } = request.user;
    const { amount, description } = request.body;

    const createTransferStatementUseCase = container.resolve(CreateTransferStatementUseCase);

    const transfer = await createTransferStatementUseCase.execute({
      amount,
      description,
      receiver_id,
      sender_id: id
    });

    return response.status(201).json(transfer);
  }
}

export { CreateTransferStatementController }
