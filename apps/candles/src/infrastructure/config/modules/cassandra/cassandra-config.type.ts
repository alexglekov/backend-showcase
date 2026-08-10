export interface CassandraConfig {
  cassandra: {
    keyspacesName: string;
    accessKey: string;
    secretAccessKey: string;
    region: string;
    endpoint: string;
    port?: number;
    ca?: string;
    storageType: 'aws' | 'local';
  };
}
