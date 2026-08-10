import { Injectable } from '@nestjs/common';
import { EntryType, GameTypeEnum } from '@prisma/client';
import { WalletLedgerService } from '@xyro/libs/ledger';

interface GetUserBalanceParams {
  userId: string;
}

interface GetUserBalanceOperationsParams {
  userId: string;
  take: number;
  skip: number;
  type?: EntryType;
  gameMode?: GameTypeEnum;
}

interface GetUserBalanceHistoryParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class WalletsService {
  constructor(
    private readonly ledgerService: WalletLedgerService,
  ) {}

  public async getUserBalance(params: GetUserBalanceParams) {
    const balance = await this.ledgerService.getCurrentUserBalance({ userId: params.userId });

    return balance;
  }

  public async getUserBalanceOperations(params: GetUserBalanceOperationsParams) {
    const entries = await this.ledgerService.getUserBalanceOperations(params);
    const totalEntries = await this.ledgerService.getCountUserBalanceOperations(params);

    return {
      take: params.take,
      skip: params.skip,
      total: totalEntries,
      entries,
    };
  }

  public async getUserBalanceHistory(params: GetUserBalanceHistoryParams) {
    return this.ledgerService.getUserBalanceHistory(params);
  }
}