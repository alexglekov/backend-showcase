import { ObjectCannedACL, S3ClientConfig } from '@aws-sdk/client-s3';

export interface StorageModuleOptions extends S3ClientConfig {
  acl: ObjectCannedACL;
  bucketName: string;
  endpoint?: string;
  expiresIn: number;
}
