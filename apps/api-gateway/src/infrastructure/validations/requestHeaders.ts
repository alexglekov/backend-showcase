import { ExecutionContext, HttpException, HttpStatus, createParamDecorator } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validate } from 'class-validator';

export const RequestHeaders = createParamDecorator(
  async (value:  any, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;

    const dto = plainToInstance(value, headers, { excludeExtraneousValues: true });

    const errors: ValidationError[] = await validate(dto);
    
    if (errors.length > 0) {
      let validationErrors = errors.map(obj => Object.values(obj.constraints!));
      throw new HttpException(`Validation failed with following errors on headers: ${validationErrors}`, HttpStatus.BAD_REQUEST);
    }

    return dto;
  },
);
