import 'reflect-metadata';

export const METHOD_NOT_ALLOWED_ON_METADATA_KEY = 'METHOD_NOT_ALLOWED_ON_METADATA_KEY';
export const METHOD_ALLOWED_ONLY_ON_METADATA_KEY = 'METHOD_ALLOWED_ONLY_ON_METADATA_KEY';

export function MethodNotAllowedOn(stages: string[]): any {
  return (target: Object, propertyKey: (string | symbol) | undefined) => {
    if (propertyKey) {
      return Reflect.defineMetadata(METHOD_NOT_ALLOWED_ON_METADATA_KEY, stages, target.constructor, propertyKey);
    }

    return Reflect.defineMetadata(METHOD_NOT_ALLOWED_ON_METADATA_KEY, stages, target);
  }
}

export function MethodAllowedOnlyOn(stages: string[]): any {
  return (target: Object, propertyKey: (string | symbol) | undefined) => {
    if (propertyKey) {
      return Reflect.defineMetadata(METHOD_ALLOWED_ONLY_ON_METADATA_KEY, stages, target.constructor, propertyKey);
    }

    return Reflect.defineMetadata(METHOD_ALLOWED_ONLY_ON_METADATA_KEY, stages, target);
  }
}
