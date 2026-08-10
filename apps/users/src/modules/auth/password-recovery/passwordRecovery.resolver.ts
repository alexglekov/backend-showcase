import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Void } from '@xyro/libs/graphql';

import { PasswordRecoveryService } from './passwordRecovery.service';
import { RecoveryPasswordInput, RequestRecoveryPasswordInput } from './passwordRecoveryGraphQLModels';

@Resolver()
export class PasswordRecoveryResolver {
  constructor(
    private readonly service: PasswordRecoveryService,
  ) {}

  @Mutation(() => Void)
  async requestRecoveryPassword(@Args('data') payload: RequestRecoveryPasswordInput) {
    await this.service.sendRecoveryMessage(payload);

    return true;
  }

  @Mutation(() => Void)
  async recoveryPassword(@Args('data') payload: RecoveryPasswordInput) {
    await this.service.recoveryPassword(payload);

    return true;
  }
}
