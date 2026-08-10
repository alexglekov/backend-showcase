import { createHash } from 'node:crypto';

export const createMD5Hash = (line: string) => createHash('md5').update(line).digest("hex");

