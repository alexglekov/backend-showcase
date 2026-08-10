import {
  DeleteFileParams,
  DeleteFileResult,
  GetFileUriParams,
  GetFileUriResult,
  PutFileParams,
  PutFileResult,
  PutFileViaBufferParams,
  PutFileViaBufferResult,
} from './interfaces/storage.inteface';

export abstract class StorageService {
  public abstract getFileUri(
    params: GetFileUriParams,
  ): Promise<GetFileUriResult>;

  public abstract putFile(params: PutFileParams): Promise<PutFileResult>;

  public abstract putFileViaBuffer(
    params: PutFileViaBufferParams,
  ): Promise<PutFileViaBufferResult>;

  public abstract deleteFile(params: DeleteFileParams): Promise<DeleteFileResult>;
}
