import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@xyro/libs/logger';

import { StorageModuleOptions } from './interfaces/storage.options';
import { StorageService } from './storage.service-port';
import { STORAGE_MODULE_CONFIG_TOKEN } from './tokens';
import {
  DeleteFileParams,
  GetFileUriParams,
  GetFileUriResult,
  PutFileParams,
  PutFileResult,
  PutFileViaBufferParams,
  PutFileViaBufferResult,
} from './interfaces/storage.inteface';
import { convertReadStreamToBuffer } from './utils/conver-read-stream-to-buffer';

@Injectable()
export class AwsStorageServiceAdapter extends StorageService {
  private readonly s3: S3Client;
  private readonly acl: string;
  private readonly bucketName: string;
  private readonly expiresIn: number;

  constructor(
    @Inject(STORAGE_MODULE_CONFIG_TOKEN) options: StorageModuleOptions,
    private readonly logger: LoggerService,
  ) {
    super();

    this.logger.setContext(AwsStorageServiceAdapter.name);

    const { acl, bucketName, expiresIn, ...s3Options } = options;

    this.acl = acl;
    this.bucketName = bucketName;
    this.expiresIn = expiresIn;

    this.s3 = new S3Client(s3Options);
  }

  public async putFileViaBuffer(
    params: PutFileViaBufferParams,
  ): Promise<PutFileViaBufferResult> {
    const { fileBuffer, name, subPath, mimetype } = params;
    let key = params.key;

    if (!key) {
      if (!name || !subPath) {
        throw new Error('Missing key, name, or subPath');
      }
      key = `${subPath}/${name}`;
    }

    const param = {
      ACL: this.acl,
      Body: fileBuffer,
      Bucket: this.bucketName,
      ContentType: mimetype,
      Key: key,
    } as PutObjectCommandInput;

    const command = new PutObjectCommand(param);

    await this.s3.send(command);

    return {
      key,
    };
  }

  public async getFileUri({
    key,
  }: GetFileUriParams): Promise<GetFileUriResult> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const signedUri = await getSignedUrl(this.s3, command, {
      expiresIn: this.expiresIn,
    });

    return {
      key,
      uri: signedUri,
    };
  }

  async putFile({
    file,
    name,
    subPath,
    key,
  }: PutFileParams): Promise<PutFileResult> {
    const { createReadStream, mimetype } = file;

    if (!key) {
      if (!name || !subPath) {
        throw new Error('Missing key, name, or subPath');
      }
      key = `${subPath}/${name}`;
    }

    const buffer = await convertReadStreamToBuffer(createReadStream());

    const param = {
      ACL: this.acl,
      Body: buffer,
      Bucket: this.bucketName,
      ContentType: mimetype,
      Key: key,
    } as PutObjectCommandInput;

    const command = new PutObjectCommand(param);

    await this.s3.send(command);

    return {
      key,
    };
  }

  public async deleteFile(params: DeleteFileParams) {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
    });

    await this.s3.send(deleteObjectCommand);
  }
}
