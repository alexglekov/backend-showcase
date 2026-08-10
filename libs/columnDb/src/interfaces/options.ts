import { DseClientOptions } from 'cassandra-driver';

export type Keyspace = {
  name: string;
};

export type ColumnOrientedDatabaseModuleOptions = {
  storageType: 'aws' | 'local';
  namespace: string;
} & DseClientOptions;

export interface FindOptions {
  limit?: number;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
  timestamp?: {
    lte?: Date;
    gte?: Date;
  };
}
export interface InsertParams {
  price: number;
  timestamp: Date;
}
