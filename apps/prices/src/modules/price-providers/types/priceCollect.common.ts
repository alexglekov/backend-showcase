export type AssetId = string;
export type SourceId = string;

export type SourceType = { sum: number; count: number };
export type SpreadDataType = {
  spread: number;
  spreadPreviousPrice: number;
};

export type HeapType = Record<AssetId, Record<SourceId, SourceType>>;
export type PricesType = Record<AssetId, number>;
export type SpreadsType = Record<AssetId, Record<SourceId, SpreadDataType>>;

export type PriceRawData = { assetId: string; price: number };
export type PriceTimeData = PriceRawData & {
  timestamp: number;
};
