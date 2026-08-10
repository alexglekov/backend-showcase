export type CandleDataType = {
  open: number;
  close: number;
  high: number;
  low: number;
  opentime: Date;
  closetime: Date;
};

export type CandleRawType = CandleDataType & {
  assetid: string;
  timeframe: number;
};
