import { Readable } from 'node:stream';

export interface PutFileParams {
  file: {
    createReadStream(): Readable;
    mimetype: string;
  };
  key?: string;
  name?: string;
  subPath?: string;
}
export interface PutFileResult {
  key: string;
}

export interface PutFileViaBufferParams {
  fileBuffer: Buffer;
  mimetype: string;
  key?: string;
  name?: string;
  subPath?: string;
}
export interface PutFileViaBufferResult {
  key: string;
}

export interface DeleteFileParams {
  key: string;
}
export type DeleteFileResult = void;

export interface GetFileUriParams {
  key: string;
}
export interface GetFileUriResult {
  key: string;
  uri: string;
}
