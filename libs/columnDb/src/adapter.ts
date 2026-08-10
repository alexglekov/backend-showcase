import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AssetRawPrice, AssetService, CandleRaw } from './port';
import { ArrayOrObject, Client, types } from 'cassandra-driver';

import {
  ColumnOrientedDatabaseModuleOptions,
  FindOptions,
} from './interfaces/options';
import { COLUMN_ORIENTED_DATABASE_OPTIONS } from './tokens';

const PRICES_TABLE = 'prices';
const CANDLES_TABLE = 'candles';

const DEFAULT_CONSISTENCY = types.consistencies.localQuorum;

@Injectable()
export class AssetServiceAdapter extends AssetService implements OnModuleInit {
  private readonly client: Client;
  private readonly storageType: 'aws' | 'local';

  private readonly namespace: string;
  private readonly keyPrices: string;
  private readonly keyCandles: string;

  constructor(
    @Inject(COLUMN_ORIENTED_DATABASE_OPTIONS)
    options: ColumnOrientedDatabaseModuleOptions
  ) {
    super();

    const { storageType, namespace, ...clientOptions } = options;

    this.namespace = namespace;
    this.keyPrices = `${this.namespace}.${PRICES_TABLE}`;
    this.keyCandles = `${this.namespace}.${CANDLES_TABLE}`;

    this.client = new Client(clientOptions);
    this.storageType = storageType;
  }

  async onModuleInit() {
    await this.initPricesKeySpaceAndTables();
  }

  public async findManyByAsset(
    asset: string,
    options?: FindOptions
  ): Promise<AssetRawPrice[]> {
    let query = `SELECT timestamp, price FROM ${this.keyPrices} WHERE assetname = ?`;

    const params = [asset];

    if (options) {
      const conditions = [];
      if (options.timestamp && options.timestamp.lte) {
        conditions.push('timestamp <= ?');
        params.push(options.timestamp.lte.toString());
      }
      if (options.timestamp && options.timestamp.gte) {
        conditions.push('timestamp >= ?');
        params.push(options.timestamp.gte.toString());
      }

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      if (options.orderBy) {
        const orderByField = Object.keys(options.orderBy)[0];
        const orderByDirection = options.orderBy[orderByField] || 'asc';
        query += ` ORDER BY ${orderByField} ${orderByDirection}`;
      }

      if (options.limit) {
        query += ' LIMIT ?';
        params.push(options.limit.toString());
      }
    }

    const result = await this.client.execute(query, params, { prepare: true });

    const rows = result.rows.map((row) => ({
      timestamp: row.get('timestamp'),
      price: Number(row.get('price')),
    }));
    return rows;
  }

  public async findLatestPriceByAsset(
    asset: string
  ): Promise<AssetRawPrice | null> {
    const query = `SELECT timestamp, price FROM ${this.keyPrices} WHERE assetname = ? ORDER BY timestamp DESC LIMIT 1`;

    const result = await this.client.execute(query, [asset]);

    if (result.rowLength === 0) {
      return null;
    }

    const row = result.first();

    return {
      timestamp: row.get('timestamp'),
      price: Number(row.get('price')),
    };
  }

  public async findPriceByAssetAndTimestamp(
    asset: string,
    timestamp: Date
  ): Promise<AssetRawPrice | null> {
    const query = `SELECT 
      timestamp, price
    FROM ${this.keyPrices} 
    WHERE 
      assetname = ? 
      AND timestamp >= ? 
    ORDER BY timestamp ASC 
    LIMIT 1`;

    const result = await this.client.execute(query, [asset, timestamp]);

    if (result.rowLength === 0) {
      return null;
    }

    const row = result.first();

    return {
      timestamp: row.get('timestamp'),
      price: Number(row.get('price')),
    };
  }

  public async findPricesByRange(
    asset: string,
    startDate: Date,
    endDate: Date
  ): Promise<AssetRawPrice[]> {
    const query = `SELECT 
    assetname, timestamp, price 
    FROM ${this.keyPrices} 
    WHERE 
      assetname = ? 
      AND timestamp >= ?  
      AND timestamp < ? 
    ORDER BY timestamp ASC
    LIMIT 1000`;

    const result = await this.client.execute(query, [
      asset,
      startDate,
      endDate,
    ]);

    return result.rows.map((row) => ({
      assetid: row.get('assetname'),
      timestamp: row.get('timestamp'),
      price: Number(row.get('price')),
    }));
  }

  public async findCandlesByRange(
    asset: string,
    timeframe: number,
    startDate: Date,
    endDate: Date
  ): Promise<CandleRaw[]> {
    const query = `SELECT 
      assetid, 
      timeframe, 
      opentime, 
      closetime, 
      open, 
      close, 
      high, 
      low
     FROM ${this.keyCandles} 
     WHERE 
      assetId = ? 
      AND timeframe = ?
       AND opentime >= ?
        AND opentime <= ? 
    ORDER BY opentime DESC
    ALLOW FILTERING`;

    const params = [asset, String(timeframe), startDate, endDate];
    const result = await this.client.execute(query, params, { prepare: true });

    return result.rows.map((row) => row as any as CandleRaw);
  }

  public async delete(asset: string, timestamp: Date): Promise<void> {
    const query = `DELETE FROM ${this.keyPrices} WHERE assetname = ? AND timestamp = ? ALLOW FILTERING`;

    await this.client.execute(query, [asset, timestamp]);
  }

  public async insertBatch(
    batch: { price: number; timestamp: Date; asset: string }[]
  ) {
    if (!batch.length) return;

    const preparedQueries: Array<
      string | { query: string; params?: ArrayOrObject }
    > = [];

    for (const bag of batch) {
      preparedQueries.push({
        query: `INSERT INTO ${
          this.keyPrices
        } (assetname, price, timestamp) VALUES ('${bag.asset}', '${String(
          bag.price
        )}', '${bag.timestamp.toISOString()}')`,
        params: [],
      });
    }

    if (this.storageType === 'aws') {
      await this.client.batch(preparedQueries, {
        prepare: true,
        logged: false,
        consistency: DEFAULT_CONSISTENCY,
      });
    } else {
      await this.client.batch(preparedQueries, {
        prepare: true,
      });
    }
  }

  public async insertCandlesBatch(
    batch: CandleRaw[]
  ): Promise<types.ResultSet | undefined> {
    if (!batch.length) return;

    const preparedQueries: Array<
      string | { query: string; params?: ArrayOrObject }
    > = [];

    for (const bag of batch) {
      preparedQueries.push({
        query: `INSERT INTO ${
          this.keyCandles
        } (assetid, timeframe, opentime, closetime, open, close, high, low) 
        VALUES ('${bag.assetid}', 
        '${String(bag.timeframe)}', 
        '${this.serializeDate(bag.opentime)}',
        '${this.serializeDate(bag.closetime)}',
        '${String(bag.open)}',
        '${String(bag.close)}',
        '${String(bag.high)}',
        '${String(bag.low)}')`,
        params: [],
      });
    }

    if (this.storageType === 'aws') {
      return await this.client.batch(preparedQueries, {
        prepare: true,
        logged: false,
        consistency: DEFAULT_CONSISTENCY,
      });
    } else {
      return await this.client.batch(preparedQueries, {
        prepare: true,
      });
    }
  }

  private async initPricesKeySpaceAndTables() {
    await this.client.execute(
      `CREATE KEYSPACE IF NOT EXISTS ${this.namespace} WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 3 };`
    );

    await this.client.execute(
      `CREATE TABLE IF NOT EXISTS ${this.keyPrices} (
        assetname text,
        timestamp timestamp,
        price text,
        PRIMARY KEY (assetname, timestamp)
      )`
    );

    await this.client.execute(
      `CREATE TABLE IF NOT EXISTS ${this.keyCandles} (
        assetid text,
        opentime timestamp,
        closetime timestamp,
        timeframe int,
        high text,
        low text,
        open text,
        close text,
        PRIMARY KEY (assetid, opentime, timeframe)
      )`
    );
  }

  private serializeDate(date: Date | string) {
    if (typeof date === 'object') {
      return date.toISOString();
    }

    return date;
  }
}
