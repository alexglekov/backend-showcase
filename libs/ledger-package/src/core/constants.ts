import { resolveAccountName } from './accountNames.util';
import {
  AccountNames,
  AssetsAccounts,
  FeesAccounts,
  FundsAccounts,
  IncomeAccounts,
  LiabilitiesAccounts,
  NetworkFeeAccounts,
  OutcomeAccounts,
} from './enums';

export const ledgerSystemAccounts = [
  AccountNames.Assets,
  AccountNames.Income,
  AccountNames.Outcome,
  AccountNames.Liabilities,
  resolveAccountName([
    AccountNames.Liabilities,
    LiabilitiesAccounts.userBalance,
  ]),
  resolveAccountName([AccountNames.Assets, AssetsAccounts.usd]),
  resolveAccountName([AccountNames.Income, IncomeAccounts.funds]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.funds,
    FundsAccounts.x1000,
  ]),
  resolveAccountName([AccountNames.Liabilities, LiabilitiesAccounts.bets]),
  resolveAccountName([AccountNames.Income, IncomeAccounts.fee]),
  resolveAccountName([AccountNames.Outcome, OutcomeAccounts.networkFee]),
  resolveAccountName([AccountNames.Outcome, OutcomeAccounts.bonus]),
  resolveAccountName([
    AccountNames.Outcome,
    OutcomeAccounts.networkFee,
    NetworkFeeAccounts.withdraw,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.deposit,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.bullseye,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.oneVsOne,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.setup,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.updown,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.withdraw,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.hourly,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.flatFee,
  ]),
  resolveAccountName([
    AccountNames.Income,
    IncomeAccounts.fee,
    FeesAccounts.x1000,
  ]),
];
