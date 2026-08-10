export enum AccountNames {
  Assets = 'Assets',
  Liabilities = 'Liabilities',
  Income = 'Income',
  Outcome = 'Outcome',
}

export enum OutcomeAccounts {
  networkFee = 'networkFee',
  bonus = 'bonus',
}

export enum NetworkFeeAccounts {
  withdraw = 'withdraw',
}

export enum AssetsAccounts {
  usd = 'usd',
}

export enum LiabilitiesAccounts {
  bets = 'bets',
  userBalance = 'userBalance',
}

export enum UserBalanceAccouns {
  hold = 'hold',
}

export enum IncomeAccounts {
  funds = 'funds',
  fee = 'fee',
}

export enum FundsAccounts {
  x1000 = 'x1000',
}

export enum FeesAccounts {
  deposit = 'deposit',
  withdraw = 'withdraw',
  oneVsOne = '1vs1',
  setup = 'setup',
  updown = 'updown',
  bullseye = 'bullseye',
  x1000 = 'x1000',
  flatFee = 'flatFee',
  hourly = 'hourly',
}

export enum FeeTypeEnum {
  PNL_FEE = 'PNL_FEE',
  FLAT_FEE = 'FLAT_FEE',
}
