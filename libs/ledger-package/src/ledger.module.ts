import {
  DynamicModule,
  ForwardReference,
  Module,
  OnModuleInit,
  Provider,
  Type,
} from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '@xyro/libs/logger';

import { JournalService } from './internal-services/journal.service';
import { EntryService } from './internal-services/entry.service';
import { AccountService } from './internal-services/account.service';
import { BalanceService } from './internal-services/balance.service';
import { UpdateBalancesCronService } from './cron-jobs/balance-cron';
import { PaymentLedgerService } from './external-services/paymentLedger.service';
import { GameLedgerService } from './external-services/gameLedger.service';
import { LedgerPrismaService } from './internal-services/prisma.service';
import { WalletLedgerService } from './external-services/walletLedger.service';
import { BalanceSubscriber } from './external-services/balanceSubscribers.service';
import { BALANCE_SUBSCRIBER_TOKEN } from './external-services/constants';
import { AnalyticsLedgerService } from './external-services/analyticsLedger.service';
import { AccountsLedgerService } from './external-services/accountLedger.service';
import { RewardsLedgerService } from './external-services/rewardLedger.service';
import { NftLedgerService } from './external-services/nftLedger.service';

interface LedgerModuleAsyncOptions {
  isMaster: boolean;
  balanceSubscribers: Provider<BalanceSubscriber>[];
  include: Array<
    Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
}

@Module({})
export class LedgerModule implements OnModuleInit {
  constructor(private readonly accountService: AccountService) {}

  async onModuleInit() {
    await this.accountService.createIfNotExistSystemAccounts();
  }

  static forRootAsync(options: LedgerModuleAsyncOptions): DynamicModule {
    const imports: any[] = [...options.include, LoggerModule.forRoot()];
    const providers: Provider[] = [
      LedgerPrismaService,
      JournalService,
      EntryService,
      AccountService,
      BalanceService,
      AnalyticsLedgerService,
      PaymentLedgerService,
      GameLedgerService,
      WalletLedgerService,
      AccountsLedgerService,
      RewardsLedgerService,
      NftLedgerService,
    ];

    if (options.isMaster) {
      providers.push(...options.balanceSubscribers);
      providers.push({
        inject: options.balanceSubscribers as any,
        useFactory: (...args) => args,
        provide: BALANCE_SUBSCRIBER_TOKEN,
      });

      providers.push(UpdateBalancesCronService);
      imports.push(ScheduleModule.forRoot());
    }

    return {
      module: LedgerModule,
      imports,
      providers,
      global: true,
      exports: [
        AnalyticsLedgerService,
        PaymentLedgerService,
        GameLedgerService,
        WalletLedgerService,
        AccountsLedgerService,
        RewardsLedgerService,
        NftLedgerService,
      ],
    };
  }

  static forRoot(isMaster: boolean = false): DynamicModule {
    const imports: any[] = [LoggerModule.forRoot()];
    const providers: Array<Provider> = [
      LedgerPrismaService,
      JournalService,
      EntryService,
      AccountService,
      BalanceService,
      AnalyticsLedgerService,
      PaymentLedgerService,
      GameLedgerService,
      WalletLedgerService,
      AccountsLedgerService,
      RewardsLedgerService,
      NftLedgerService,
    ];

    if (isMaster) {
      providers.push(UpdateBalancesCronService);
      imports.push(ScheduleModule.forRoot());
    }

    return {
      module: LedgerModule,
      imports,
      providers,
      global: true,
      exports: [
        AnalyticsLedgerService,
        PaymentLedgerService,
        GameLedgerService,
        WalletLedgerService,
        AccountsLedgerService,
        RewardsLedgerService,
        NftLedgerService,
      ],
    };
  }
}
