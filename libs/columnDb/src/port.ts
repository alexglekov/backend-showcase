import { types } from 'cassandra-driver';
import { FindOptions } from './interfaces/options';

export type AssetRawPrice = {
  assetid?: string;
  timestamp: Date;
  price: number;
};

export type CandleRaw = {
  assetid: string;
  timeframe: number;
  opentime: Date;
  closetime: Date;
  open: number;
  close: number;
  high: number;
  low: number;
};

export abstract class AssetService {
  abstract findManyByAsset(
    asset: string,
    options?: FindOptions
  ): Promise<AssetRawPrice[]>;

  abstract findLatestPriceByAsset(asset: string): Promise<AssetRawPrice | null>;

  abstract findPriceByAssetAndTimestamp(
    asset: string,
    timestamp: Date
  ): Promise<AssetRawPrice | null>;

  abstract findPricesByRange(
    asset: string,
    startDate: Date,
    endDate: Date
  ): Promise<AssetRawPrice[]>;

  abstract delete(asset: string, timestamp: Date): Promise<void>;

  abstract insertBatch(
    batch: { price: number; timestamp: Date; asset: string }[]
  ): Promise<void>;

  abstract insertCandlesBatch(
    batch: CandleRaw[]
  ): Promise<types.ResultSet | undefined>;

  abstract findCandlesByRange(
    asset: string,
    timeframe: number,
    startDate: Date,
    endDate: Date
  ): Promise<CandleRaw[]>;
}
