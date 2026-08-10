import { StorageConfig } from './storage-config.type';

export const loadStorageConfig = (): StorageConfig => {
  return {
    storage: {
      s3storageType: process.env.S3_STORAGE_TYPE! as any,
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      bucket: process.env.AWS_S3_BUCKET!,
      endpoint: process.env.AWS_S3_ENDPOINT!,
      region: process.env.AWS_REGION!,
      expiresIn: Number(process.env.AWS_S3_EXPIRES_IN),
    },
  };
};
