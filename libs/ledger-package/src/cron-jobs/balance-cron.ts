import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@xyro/libs/logger';

import { BalanceService } from '../internal-services/balance.service';
import { LedgerBalanceEntity } from '../entities/balance.entity';
import { BalanceSubscriber } from '../external-services/balanceSubscribers.service';
import { BALANCE_SUBSCRIBER_TOKEN } from '../external-services/constants';

const REFRESH_BALANCES_INTERVAL_MS = 1000;

@Injectable()
export class UpdateBalancesCronService {
  private isWorking = false;

  constructor(
    @Inject(BALANCE_SUBSCRIBER_TOKEN)
    private readonly balanceSubscribers: BalanceSubscriber[],
    private readonly balanceService: BalanceService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext(UpdateBalancesCronService.name);
  }

  @Interval(REFRESH_BALANCES_INTERVAL_MS)
  async handle() {
    if (!this.isWorking) {
      this.isWorking = true;

      let updatedBalances: Map<string, LedgerBalanceEntity> = new Map();
      try {
        updatedBalances = await this.balanceService.refreshBalances();
      } catch (error) {
        this.logger.error('Error updating balances:', error);
      } finally {
        this.isWorking = false;

        await Promise.all(
          Array.from(updatedBalances)
            .map(async ([accountId, balance]) =>
              this.balanceSubscribers.map((subscriber) =>
                subscriber.balanceUpdated(balance.account.accountName, balance)
              )
            )
            .flat(1)
        );
      }
    }
  }
}
