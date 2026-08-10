import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { MethodAllowedOnlyOnStagesException, MethodNotAllowedOnStageException } from '@xyro/libs/exceptions';

import { METHOD_NOT_ALLOWED_ON_METADATA_KEY, METHOD_ALLOWED_ONLY_ON_METADATA_KEY } from '../decorators';

@Injectable()
export class CheckMethodAvailabilityGuard implements CanActivate {
  constructor(private readonly stage: string) {}

  canActivate(context: ExecutionContext): boolean {
    const ClassHandler = context.getClass();
    const functionHandler = context.getHandler();

    const methodNotAllowedOnStages: string[] | undefined = Reflect.getMetadata(METHOD_NOT_ALLOWED_ON_METADATA_KEY, ClassHandler, functionHandler.name)
      ?? Reflect.getMetadata(METHOD_NOT_ALLOWED_ON_METADATA_KEY, ClassHandler);

    const methodAllowedOnlyOnStages: string[] | undefined = Reflect.getMetadata(METHOD_ALLOWED_ONLY_ON_METADATA_KEY, ClassHandler, functionHandler.name)
      ?? Reflect.getMetadata(METHOD_ALLOWED_ONLY_ON_METADATA_KEY, ClassHandler);

    if (methodNotAllowedOnStages) {
      const methodIsNotAllowed = methodNotAllowedOnStages.includes(this.stage);

      if (methodIsNotAllowed) {
        throw new MethodNotAllowedOnStageException(this.stage);
      }
    }

    if (methodAllowedOnlyOnStages) {
      const methodIsAllowed = methodAllowedOnlyOnStages.includes(this.stage);

      if (!methodIsAllowed) {
        throw new MethodAllowedOnlyOnStagesException(methodAllowedOnlyOnStages);
      }
    }

    return true;
  }
}
