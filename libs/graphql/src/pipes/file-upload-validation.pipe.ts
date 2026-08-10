import { PipeTransform } from '@nestjs/common';
import { Upload } from 'graphql-upload-ts';
import { FileUpload } from 'graphql-upload-ts';

import { MaxFileSizeExceededError, MimeTypeIsNotAllowedError } from '../exceptions';

import { FileUploadValidationPipeOptions } from './file-upload-validation-pipe.interface';
import { convertReadStreamToBuffer } from '../utils/conver-read-stream-to-buffer';

export class FileUploadValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes?: string[];
  private readonly maxFileSize?: number;

  constructor(options?: FileUploadValidationPipeOptions) {
    this.allowedMimeTypes = options?.allowedMimeTypes;
    this.maxFileSize = options?.maxFileSize;
  }

  private async validateFileLength(value: FileUpload): Promise<void> {
    if (!this.maxFileSize) {
      return;
    }

    const { buffer } = value as any;

    if (buffer.byteLength > this.maxFileSize) {
      throw new MaxFileSizeExceededError();
    }
  }

  private validateMimeType(value: FileUpload): void {
    if (!this.allowedMimeTypes) {
      return;
    }

    const { mimetype } = value;

    if (!this.allowedMimeTypes.includes(mimetype)) {
      throw new MimeTypeIsNotAllowedError();
    }
  }

  private async _transform(upload: Upload) {
    const file: any = await upload.promise;

    if (!file) {
      return file;
    }

    const readStream = file.createReadStream();
    const buffer = await convertReadStreamToBuffer(readStream);

    file.buffer = buffer;

    this.validateMimeType(file);

    await this.validateFileLength(file);

    return file;
  }

  async transform(uploads: Upload | Array<Upload>) {
    if (!uploads) {
      return uploads;
    }

    if (Array.isArray(uploads)) {
      return Promise.all(uploads.map(async (upload: Upload) => this._transform(upload)));
    }

    return this._transform(uploads);
  }
}
