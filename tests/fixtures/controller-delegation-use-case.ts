import { UseCase } from "@skapxd/nest";

@UseCase()
export class ControllerDelegationUseCase {
  execute(input: object): Promise<object> {
    return Promise.resolve(input);
  }
}
