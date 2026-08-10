import { Readable } from 'node:stream';

export const convertReadStreamToBuffer = async (
  readStream: Readable,
): Promise<Buffer> => {
  const chunks = [];

  for await (const chunk of readStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
