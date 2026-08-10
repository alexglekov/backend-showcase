import type { FileUpload } from 'graphql-upload-ts'

export interface UploadedFile extends Omit<FileUpload, 'createReadStream'> {
  buffer: Buffer;
  encoding: string;
  filename: string;
  mimetype: string;
}
