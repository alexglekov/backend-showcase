import { LedgerBalanceEntity } from '../entities/balance.entity';

export abstract class BalanceSubscriber {
  abstract balanceUpdated(userId: string, balance: LedgerBalanceEntity): Promise<void>;
}