import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthcheckResolver {
  @Query(() => String)
  async healthcheck() {
    return 'OK';
  }
}