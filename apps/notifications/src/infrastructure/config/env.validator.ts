import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { EnvSchema } from './env.schema';

export const envValidator = (config: Record<string, any>) => {
  const validatedConfig = plainToClass(EnvSchema, config, { enableImplicitConversion: true });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    skipUndefinedProperties: false,
    whitelist: true,
  });

  if (errors.length) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
