export interface StorageConfig {
  storage: {
    s3storageType: 'aws' | 'minio';
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    endpoint: string;
    region: string;
    expiresIn: number;
  };
}
