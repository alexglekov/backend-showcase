type ArgumentTypes<T> = T extends new (... args: infer U ) => any ? U: never;
type ReplaceInstanceType<T, TNewInstance> = T extends new (...args: any[])=> any ? new (...a: ArgumentTypes<T>) => TNewInstance : never;

export function PickConstructor<T extends { new (...args: any[]) : any, prototype: any }>(ctor: T)
    : <TKeys extends keyof InstanceType<T>>(...keys: TKeys[]) => ReplaceInstanceType<T, Pick<InstanceType<T>, TKeys>> & { [P in keyof Omit<T, 'prototype'>] : T[P] } {
    return function (keys: string| symbol | number) { return ctor as any };
}
