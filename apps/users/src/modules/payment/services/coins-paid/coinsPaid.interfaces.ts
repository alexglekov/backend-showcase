export type CoinsPaidResponse<T> = {
  data: T
}

export enum CoinsPaidCurrencyType {
  fiat = 'fiat',
  crypto = 'crypto',
}

export enum CoinsPaidCurrencies {
  BTC = 'BTC',
  ETH = 'ETH',
  USDTT = 'USDTT',	
  USDTE = 'USDTE',
  XRP = 'XRP',
  EURS = 'EURS',
  BNB = 'BNB',
  TRX = 'TRX',
  MRX = 'MRX',
  CPD = 'CPD',
  BSC = 'BSC',
  CPDB = 'CPDB',
  USDTB = 'USDTB',
  CSC = 'CSC',
  BCH = 'BCH',
  LTC = 'LTC',
  DOGE = 'DOGE',
  ADA = 'ADA',
};

export type Fee = {
  feePercent: number,
  minAmountFee: number, // in EUR ?
  exchangeFee: number,
  minExchangeFee: number, // in EUR ?
};

export type CoinsPaidCurrency = {
  id: number;
  type: CoinsPaidCurrencyType;
  currency: CoinsPaidCurrencies;
  minimum_amount: string;
  deposit_fee_percent: string;
  withdrawal_fee_percent: string;
  precision: number;
};

export type CoinsPaidRate = {
  currency_from: {
    currency: CoinsPaidCurrencies;
    type: CoinsPaidCurrencyType;
    min_amount: string;
    min_amount_deposit_with_exchange: string;
  };
  currency_to: {
    currency: CoinsPaidCurrencies;
    type: CoinsPaidCurrencyType;
  };
  rate_from: string;
  rate_to: string;
};


export type CoinsPaidDepositAddress = {
  id: number;
  currency: CoinsPaidCurrencies;
  convert_to: CoinsPaidCurrencies;
  address: string;
  tag: string;
  foreign_id: string;
}

export type CoinsPaidWitdrawalCrypto = {
  id: number;
  foreign_id: string;
  type: CoinsPaidCallbackType;
  status: string;
  amount: string;
  sender_amount: string;
  sender_currency: CoinsPaidCurrencies;
  receiver_amount: string;
  receiver_currency: CoinsPaidCurrencies;
}

export enum CoinsPaidCallbackType {
  deposit = 'deposit',
  withdrawal = 'withdrawal',
  depositExchange = 'deposit_exchange',
  withdrawalExchange = 'withdrawal_exchange',
  exchange = 'exchange',
}

export enum CoinsPaidCallbackStatus {
  confirmed = 'confirmed',
  notConfirmed = 'not_confirmed',
  cancelled = 'cancelled',
  pending = 'pending',
}

export type CoinsPaidCallback = {
  id: number;
  foreign_id?: string;
  type: CoinsPaidCallbackType;
  crypto_address: {
    id: number;
    currency: CoinsPaidCurrencies;
    address: string;
    tag?: string;
    foreign_id?: string;
    convert_to?: string;
  };
  currency_sent: {
    currency: CoinsPaidCurrencies;
    amount: string;
  };
  currency_received: {
    currency: CoinsPaidCurrencies;
    amount: string;
    amount_minus_fee: string;
  };
  transactions: {
    id: number;
    currency: CoinsPaidCurrencies;
    transaction_type: string;
    type: CoinsPaidCallbackType;
    address?: string;
    tag?: string;
    amount: string;
    txid?: string;
    confirmations?: number;

    currency_to?: CoinsPaidCurrencies;
    amount_to?: string;
  }[];
  fees: {
    type: string;
    currency: CoinsPaidCurrencies;
    amount: string;
  }[];
  error: string;
  status: CoinsPaidCallbackStatus;
};


export type MappedCoinsPaidCallback = {
  id: number;
  foreignId?: string;
  type: CoinsPaidCallbackType;
  address: {
    id: number;
    currency: CoinsPaidCurrencies;
    address: string;
    tag?: string;
    foreignId?: string;
    convertTo?: string;
  };
  currencySent: {
    currency: CoinsPaidCurrencies;
    amount: number;
  };
  currencyReceived: {
    currency: CoinsPaidCurrencies;
    amount: number;
    amountMinusFee: number;
  };
  transactions: {
    id: number;
    currency: CoinsPaidCurrencies;
    transactionType: string;
    type: CoinsPaidCallbackType;
    address?: string;
    tag?: string;
    amount: number;
    txid?: string;
    confirmations?: number;

    currencyTo?: CoinsPaidCurrencies;
    amountTo?: number;
  }[];
  fees: {
    type: string;
    currency: CoinsPaidCurrencies;
    amount: number;
  }[];
  error: string;
  status: CoinsPaidCallbackStatus;
};
