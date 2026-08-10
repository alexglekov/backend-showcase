import * as crypto from 'crypto';

export const passwordToHash = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');

  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');

  return [salt, hash].join(':');
};

export const comparePasswords = (
  password: string,
  passwordHash: string,
): boolean => {
  const [salt, hash_] = passwordHash.split(':');

  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');

  return hash_ === hash;
};
