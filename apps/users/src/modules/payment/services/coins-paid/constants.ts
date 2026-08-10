import { CoinsPaidCurrencies, Fee } from './coinsPaid.interfaces';

export const depositFees: Record<CoinsPaidCurrencies, Fee> = {
  [CoinsPaidCurrencies.BTC]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0.5,
  },
  [CoinsPaidCurrencies.ETH]: {
    feePercent: 0.8,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.USDTT]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0.5,
  },
  [CoinsPaidCurrencies.USDTE]: {
    feePercent: 0.8,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.XRP]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0.5,
  },
  [CoinsPaidCurrencies.EURS]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.BNB]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0.5,
  },
  [CoinsPaidCurrencies.TRX]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0.5,
  },
  [CoinsPaidCurrencies.MRX]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0.5,
  },
  [CoinsPaidCurrencies.CPD]: {
    feePercent: 0.8,
    minAmountFee: 0.5,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.BSC]: {
    feePercent: 0.8,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.CPDB]: {
    feePercent: 0.8,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.USDTB]: {
    feePercent: 0.8,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.CSC]: {
    feePercent: 0.8,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.BCH]: {
    feePercent: 0.8,
    minAmountFee: 0.0001,
    exchangeFee: 1,
    minExchangeFee: 0.0001,
  },
  [CoinsPaidCurrencies.LTC]: {
    feePercent: 0.8,
    minAmountFee: 0.0001,
    exchangeFee: 1,
    minExchangeFee: 0.0001,
  },
  [CoinsPaidCurrencies.DOGE]: {
    feePercent: 0.8,
    minAmountFee: 0.0001,
    exchangeFee: 1,
    minExchangeFee: 0.0001,
  },
  [CoinsPaidCurrencies.ADA]: {
    feePercent: 0.8,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0.0,
  },
}

export const withdrawFees: Record<CoinsPaidCurrencies, Fee> = {
  [CoinsPaidCurrencies.BTC]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.ETH]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.USDTT]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,

  },
  [CoinsPaidCurrencies.USDTE]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.XRP]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.EURS]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.BNB]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.TRX]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.MRX]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.CPD]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.BSC]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.CPDB]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.USDTB]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.CSC]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  },
  [CoinsPaidCurrencies.BCH]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 0.8,
    minExchangeFee: 0.0001,
  },
  [CoinsPaidCurrencies.LTC]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 0.8,
    minExchangeFee: 0.0001,
  },
  [CoinsPaidCurrencies.DOGE]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 0.8,
    minExchangeFee: 0.0001,
  },
  [CoinsPaidCurrencies.ADA]: {
    feePercent: 0,
    minAmountFee: 0,
    exchangeFee: 1,
    minExchangeFee: 0,
  }
}
