import { Decimal } from 'decimal.js';

import { CoinsPaidCurrencies } from './coins-paid';

export const withdrawNetworkFeeToHoldMap: Record<CoinsPaidCurrencies, Decimal> = {
  BTC: new Decimal(50),
  ETH: new Decimal(30),
  USDTT: new Decimal(10),
  USDTE: new Decimal(10),
  XRP: new Decimal(3),
  EURS: new Decimal(3),
  BNB: new Decimal(3),
  TRX: new Decimal(3),
  MRX: new Decimal(2),
  CPD: new Decimal(2),
  BSC: new Decimal(2),
  CPDB: new Decimal(2),
  USDTB: new Decimal(2),
  CSC: new Decimal(2),
  BCH: new Decimal(2),
  LTC: new Decimal(2),
  DOGE: new Decimal(2),
  ADA: new Decimal(2),
}
