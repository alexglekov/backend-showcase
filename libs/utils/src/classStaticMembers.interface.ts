export type ClassStaticMembers<T> = {
  [Key in keyof T as Key extends "prototype" ? never : Key]: T[Key];
}
