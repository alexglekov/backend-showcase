import { FileUpload } from "graphql-upload-ts";

export const convertReadStreamToBuffer = async (
  readStream: ReturnType<FileUpload['createReadStream']>,
): Promise<Buffer> => {
  const chunks = [];

  for await (const chunk of readStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
