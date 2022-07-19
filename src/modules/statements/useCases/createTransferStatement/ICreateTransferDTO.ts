import { Statement } from "../../entities/Statement";

export interface ICreateTransferDTO extends Pick<Statement,
  'user_id' |
  'description' |
  'amount' |
  'type'
> {
  sender_id: string;
}
