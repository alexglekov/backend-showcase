export const PERMISSIONS_TOKEN = 'PERMISSIONS_TOKEN';

export const UsePermissions = (permissions: string[]) => {
  return (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(PERMISSIONS_TOKEN, permissions, target, propertyKey);
  }
}
