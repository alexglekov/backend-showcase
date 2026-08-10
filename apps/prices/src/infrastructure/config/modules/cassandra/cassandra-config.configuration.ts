import { CassandraConfig } from './cassandra-config.type';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const loadCassandraConfig = (): CassandraConfig => {
  return {
    cassandra: {
      keyspacesName: process.env.AWS_KEYSPACES_NAME!,
      accessKey: process.env.AWS_KEYSPACES_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_KEYSPACES_SECRET_ACCESS_KEY!,
      region: process.env.AWS_KEYSPACES_REGION!,
      endpoint: process.env.AWS_KEYSPACES_ENDPOINT!,
      port: Number(process.env.AWS_KEYSPACES_PORT),
      ca:
        process.env.KEYSPACE_STORAGE_TYPE === 'aws'
          ? readFileSync(
              resolve(process.cwd(), 'certificates', 'aws-cassandra.crt'),
              'utf8'
            )
          : undefined,
      storageType: process.env.KEYSPACE_STORAGE_TYPE as any,
    },
  };
};
