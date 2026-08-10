import { Decimal } from 'decimal.js';
import { Bet, EntryType, GameTypeEnum } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaTransaction } from '@xyro/libs/utils';

import { JournalService } from '../internal-services/journal.service';
import { AccountService } from '../internal-services/account.service';
import { LedgerJournalEntity } from '../entities/journal.entity';
import { LedgerEntryEntity } from '../entities/entry.entity';
import { resolveAccountName } from '../core/accountNames.util';
import {
  AccountNames,
  FeesAccounts,
  FundsAccounts,
  IncomeAccounts,
  LiabilitiesAccounts,
} from '../core/enums';
import { BalanceService } from '../internal-services/balance.service';
import { NotEnoughBalanceForThisOperationError } from '../errors';
import { LedgerBalanceEntity } from '../entities/balance.entity';

interface GameResult {
  winners: Bet[];
  losers: Bet[];
  rejects: Bet[];
  gameId: string;
}

@Injectable()
export class GameLedgerService {
  constructor(
    private readonly journalService: JournalService,
    private readonly balanceService: BalanceService,
    private readonly accountService: AccountService,
  ) {}

  public async payBetFee(
    userId: string,
    amount: Decimal,
    gameId: string,
    dbTransaction: PrismaTransaction,
  ): Promise<LedgerBalanceEntity> {
    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        userId,
      ]),
    );

    const userBalance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction,
    );

    if (!userBalance || (userBalance && userBalance.amount.lessThan(amount))) {
      throw new NotEnoughBalanceForThisOperationError();
    }

    const incomeAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Income,
        IncomeAccounts.fee,
        FeesAccounts.x1000,
      ]),
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: `User pays bet fee ${amount.toNumber()} usd`,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userAccount.id!,
        amount: amount,
        isCredit: false,
        account: userAccount,
        isRead: true,
        type: EntryType.hourlyFee,
        meta: {
          type: EntryType.hourlyFee,
          gameId,
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: incomeAccount.id!,
        amount,
        account: incomeAccount,
        isCredit: true,
        type: EntryType.hourlyFee,
        meta: {
          type: EntryType.hourlyFee,
          gameId,
        },
      }),
    );

    await this.journalService.save(journal, dbTransaction);

    userBalance.sub(amount);
    await this.balanceService.updateBalance(userBalance, journal, dbTransaction);

    return userBalance;
  }

  public async createBet(
    userId: string,
    amount: Decimal,
    gameId: string,
    betId: string,
    gameType: GameTypeEnum,
    dbTransaction: PrismaTransaction,
  ): Promise<LedgerBalanceEntity> {
    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        userId,
      ]),
    );

    const userBalance = await this.balanceService.findBalanceByAccountId(
      userAccount.id!,
      dbTransaction,
    );

    if (!userBalance || (userBalance && userBalance.amount.lessThan(amount))) {
      throw new NotEnoughBalanceForThisOperationError();
    }

    const gameLiabilityAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.bets,
        gameId,
      ]),
    );

    const journal = new LedgerJournalEntity({
      entries: [],
      name: `User creates bet ${amount.toNumber()} usd`,
    });

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: userAccount.id!,
        amount: amount,
        account: userAccount,
        isCredit: false,
        isRead: true,
        type: EntryType.userAddBet,
        meta: {
          type: EntryType.userAddBet,
          gameId,
          betId,
          gameType,
        },
      }),
    );

    journal.addEntry(
      new LedgerEntryEntity({
        accountId: gameLiabilityAccount.id!,
        amount,
        account: gameLiabilityAccount,
        isCredit: true,
        type: EntryType.userAddBet,
        meta: {
          type: EntryType.userAddBet,
          gameId,
          betId,
          gameType,
        },
      }),
    );

    await this.journalService.save(journal, dbTransaction);

    userBalance.sub(amount);
    await this.balanceService.updateBalance(userBalance, journal, dbTransaction);

    return userBalance;
  }

  public async createGameAccount(
    gameId: string,
    dbTransaction: PrismaTransaction,
  ) {
    return this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.bets,
        gameId,
      ]),
      dbTransaction,
    );
  }

  public async createLedgerEntriesForBullsEye(
    gameResult: GameResult,
    dbTransaction: PrismaTransaction,
  ): Promise<LedgerJournalEntity | undefined> {
    const countBets =
      (gameResult.winners?.length || 0) +
      (gameResult.losers?.length || 0) +
      (gameResult.rejects?.length || 0);

    if (countBets > 0) {
      const { winners, losers, rejects, gameId } = gameResult;

      let commissionAmount = new Decimal(0);

      const totalAmount = winners
        .concat(losers)
        .concat(rejects)
        .reduce((total, bet) => total.add(bet.amount), new Decimal(0));

      let journal;

      if (rejects?.length > 0) {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game Bulls-Eye Resolve with ${
            rejects.length
          } rejected bets for ${totalAmount.toNumber()} usd`,
        });
      } else {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game Bulls-Eye Resolve with ${
            winners.length + losers.length
          } bets for ${totalAmount.toNumber()} usd`,
        });
      }

      const gameLiabilityAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Liabilities,
          LiabilitiesAccounts.bets,
          gameId,
        ]),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: gameLiabilityAccount.id!,
          amount: totalAmount,
          isCredit: false,
          account: gameLiabilityAccount,
          type: EntryType.gameResolve,
          meta: {
            type: EntryType.gameResolve,
            gameId,
            gameType: GameTypeEnum.BULLSEYE,
          },
        }),
      );

      if (rejects?.length > 0) {
        for (const reject of rejects) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              reject.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: reject.amount,
              account: userAccount,
              isCredit: true,
              type: EntryType.userRejectedBet,
              meta: {
                type: EntryType.userRejectedBet,
                gameId,
                betId: reject.id,
                gameType: GameTypeEnum.BULLSEYE,
              },
            }),
          );
        }
      } else {
        for (const bet of winners) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: bet.outcome!,
              isCredit: true,
              account: userAccount,
              type: EntryType.userWon,
              meta: {
                type: EntryType.userWon,
                gameId,
                betId: bet.id,
                gameType: GameTypeEnum.BULLSEYE,
              },
            }),
          );

          if (bet.fee) {
            commissionAmount = commissionAmount.add(bet.fee);
          }
        }

        for (const bet of losers) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: new Decimal(0),
              isCredit: false,
              isRead: true,
              account: userAccount,
              type: EntryType.userLose,
              meta: {
                type: EntryType.userLose,
                gameId,
                loseAmount: Number(bet.amount),
                betId: bet.id,
                gameType: GameTypeEnum.BULLSEYE,
              },
            }),
          );
        }
      }

      const incomeAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Income,
          IncomeAccounts.fee,
          FeesAccounts.setup,
        ]),
      );

      if (!rejects || rejects.length === 0) {
        journal.addEntry(
          new LedgerEntryEntity({
            accountId: incomeAccount.id!,
            amount: commissionAmount,
            isCredit: true,
            account: incomeAccount,
            type: EntryType.gameResolve,
            meta: {
              type: EntryType.gameResolve,
              gameId,
              gameType: GameTypeEnum.BULLSEYE,
            },
          }),
        );
      }
      return this.journalService.save(journal, dbTransaction);
    }

    return;
  }

  public async createLedgerEntriesForOneVsOne(
    gameResult: GameResult,
    dbTransaction: PrismaTransaction,
  ) {
    const countBets =
      (gameResult.winners?.length || 0) +
      (gameResult.losers?.length || 0) +
      (gameResult.rejects?.length || 0);

    if (countBets > 0) {
      const { winners, losers, rejects, gameId } = gameResult;

      let commissionAmount = new Decimal(0);

      const totalAmount = winners
        .concat(losers)
        .concat(rejects)
        .reduce((total, bet) => total.add(bet.amount), new Decimal(0));

      let journal;

      if (rejects?.length > 0) {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game 1vs1 Resolve with ${
            rejects.length
          } rejected bets for ${totalAmount.toNumber()} usd`,
        });
      } else {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game 1vs1 Resolve with ${
            winners.length + losers.length
          } bets for ${totalAmount.toNumber()} usd`,
        });
      }

      const gameLiabilityAccount =
        await this.accountService.findOrCreateAccount(
          resolveAccountName([
            AccountNames.Liabilities,
            LiabilitiesAccounts.bets,
            gameId,
          ]),
        );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: gameLiabilityAccount.id!,
          amount: totalAmount,
          isCredit: false,
          account: gameLiabilityAccount,
          type: EntryType.gameResolve,
          meta: {
            type: EntryType.gameResolve,
            gameId,
            gameType: GameTypeEnum.ONEVSONE,
          },
        }),
      );

      if (rejects?.length > 0) {
        for (const reject of rejects) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              reject.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: reject.amount,
              isCredit: true,
              account: userAccount,
              type: EntryType.userRejectedBet,
              meta: {
                type: EntryType.userRejectedBet,
                gameId,
                betId: reject.id,
                gameType: GameTypeEnum.ONEVSONE,
              },
            }),
          );
        }
      } else {
        for (const bet of winners) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: bet.outcome!,
              isCredit: true,
              account: userAccount,
              type: EntryType.userWon,
              meta: {
                type: EntryType.userWon,
                gameId,
                betId: bet.id,
                gameType: GameTypeEnum.ONEVSONE,

              },
            }),
          );

          if (bet.fee) {
            commissionAmount = commissionAmount.add(bet.fee);
          }
        }

        for (const bet of losers) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: new Decimal(0),
              isCredit: false,
              isRead: true,
              account: userAccount,
              type: EntryType.userLose,
              meta: {
                type: EntryType.userLose,
                gameId,
                loseAmount: Number(bet.amount),
                betId: bet.id,
                gameType: GameTypeEnum.ONEVSONE,
              },
            }),
          );
        }
      }

      const incomeAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Income,
          IncomeAccounts.fee,
          FeesAccounts.oneVsOne,
        ]),
      );

      if (!rejects || rejects.length === 0) {
        journal.addEntry(
          new LedgerEntryEntity({
            accountId: incomeAccount.id!,
            amount: commissionAmount,
            isCredit: true,
            account: incomeAccount,
            type: EntryType.gameResolve,
            meta: {
              type: EntryType.gameResolve,
              gameId,
              gameType: GameTypeEnum.ONEVSONE
            },
          }),
        );
      }

      return this.journalService.save(journal, dbTransaction);
    }
    return;
  }

  public async createLedgerEntriesForSetup(
    gameResult: GameResult,
    dbTransaction: PrismaTransaction,
  ) {
    const countBets =
      (gameResult.winners?.length || 0) +
      (gameResult.losers?.length || 0) +
      (gameResult.rejects?.length || 0);

    if (countBets > 0) {
      const { winners, losers, rejects, gameId } = gameResult;

      let commissionAmount = new Decimal(0);

      const totalAmount = winners
        .concat(losers)
        .concat(rejects)
        .reduce((total, bet) => total.add(bet.amount), new Decimal(0));

      let journal;

      if (rejects?.length > 0) {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game Setup Resolve with ${
            rejects.length
          } rejected bets for ${totalAmount.toNumber()} usd`,
        });
      } else {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game Setup Resolve with ${
            winners.length + losers.length
          } bets for ${totalAmount.toNumber()} usd`,
        });
      }

      const gameLiabilityAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Liabilities,
          LiabilitiesAccounts.bets,
          gameId,
        ]),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: gameLiabilityAccount.id!,
          amount: totalAmount,
          account: gameLiabilityAccount,
          isCredit: false,
          type: EntryType.gameResolve,
          meta: {
            type: EntryType.gameResolve,
            gameId,
            gameType: GameTypeEnum.SETUP,
          },
        }),
      );

      if (rejects?.length > 0) {
        for (const reject of rejects) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              reject.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: reject.amount,
              isCredit: true,
              type: EntryType.userRejectedBet,
              account: userAccount,
              meta: {
                type: EntryType.userRejectedBet,
                gameId,
                betId: reject.id,
                gameType: GameTypeEnum.SETUP
              },
            }),
          );
        }
      } else {
        for (const bet of winners) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: bet.outcome!,
              isCredit: true,
              account: userAccount,
              type: EntryType.userWon,
              meta: {
                type: EntryType.userWon,
                gameId,
                betId: bet.id,
                gameType: GameTypeEnum.SETUP
              },
            }),
          );

          if (bet.fee) {
            commissionAmount = commissionAmount.add(bet.fee);
          }
        }

        for (const bet of losers) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: new Decimal(0),
              isCredit: false,
              account: userAccount,
              isRead: true,
              type: EntryType.userLose,
              meta: {
                type: EntryType.userLose,
                gameId,
                loseAmount: Number(bet.amount),
                betId: bet.id,
                gameType: GameTypeEnum.SETUP,
              },
            }),
          );
        }
      }

      const incomeAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Income,
          IncomeAccounts.fee,
          FeesAccounts.setup,
        ]),
      );

      if (!rejects || rejects.length === 0) {
        journal.addEntry(
          new LedgerEntryEntity({
            accountId: incomeAccount.id!,
            amount: commissionAmount,
            account: incomeAccount,
            isCredit: true,
            type: EntryType.gameResolve,
            meta: {
              type: EntryType.gameResolve,
              gameId,
              gameType: GameTypeEnum.SETUP,
            },
          }),
        );
      }

      return this.journalService.save(journal, dbTransaction);
    }
    return;
  }

  public async createLedgerEntriesForUpDown(
    gameResult: GameResult,
    dbTransaction: PrismaTransaction,
  ) {
    const countBets =
      (gameResult.winners?.length || 0) +
      (gameResult.losers?.length || 0) +
      (gameResult.rejects?.length || 0);

    if (countBets > 0) {
      const { winners, losers, rejects, gameId } = gameResult;

      let commissionAmount = new Decimal(0);

      const totalAmount = winners
        .concat(losers)
        .concat(rejects)
        .reduce((total, bet) => total.add(bet.amount), new Decimal(0));

      let journal;

      if (rejects?.length > 0) {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game UpDown Resolve with ${
            rejects.length
          } rejected bets for ${totalAmount.toNumber()} usd`,
        });
      } else {
        journal = new LedgerJournalEntity({
          entries: [],
          name: `Game UpDown Resolve with ${
            winners.length + losers.length
          } bets for ${totalAmount.toNumber()} usd`,
        });
      }

      const gameLiabilityAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Liabilities,
          LiabilitiesAccounts.bets,
          gameId,
        ]),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: gameLiabilityAccount.id!,
          amount: totalAmount,
          account: gameLiabilityAccount,
          isCredit: false,
          type: EntryType.gameResolve,
          meta: {
            type: EntryType.gameResolve,
            gameId,
            gameType: GameTypeEnum.UPDOWN,
          },
        }),
      );

      if (rejects?.length > 0) {
        for (const reject of rejects) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              reject.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: reject.amount,
              account: userAccount,
              isCredit: true,
              type: EntryType.userRejectedBet,
              meta: {
                type: EntryType.userRejectedBet,
                gameId,
                betId: reject.id,
                gameType: GameTypeEnum.UPDOWN,
              },
            }),
          );
        }
      } else {
        for (const bet of winners) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: bet.outcome!,
              isCredit: true,
              type: EntryType.userWon,
              account: userAccount,
              meta: {
                type: EntryType.userWon,
                gameId,
                betId: bet.id,
                gameType: GameTypeEnum.UPDOWN,
              },
            }),
          );

          if (bet.fee) {
            commissionAmount = commissionAmount.add(bet.fee);
          }
        }

        for (const bet of losers) {
          const userAccount = await this.accountService.findOrCreateAccount(
            resolveAccountName([
              AccountNames.Liabilities,
              LiabilitiesAccounts.userBalance,
              bet.ownerId,
            ]),
          );

          journal.addEntry(
            new LedgerEntryEntity({
              accountId: userAccount.id!,
              amount: new Decimal(0),
              isCredit: false,
              account: userAccount,
              isRead: true,
              type: EntryType.userLose,
              meta: {
                type: EntryType.userLose,
                gameId,
                loseAmount: Number(bet.amount),
                betId: bet.id,
                gameType: GameTypeEnum.UPDOWN,
              },
            }),
          );
        }
      }

      const incomeAccount = await this.accountService.findOrCreateAccount(
        resolveAccountName([
          AccountNames.Income,
          IncomeAccounts.fee,
          FeesAccounts.updown,
        ]),
      );

      if (!rejects || rejects.length === 0) {
        journal.addEntry(
          new LedgerEntryEntity({
            accountId: incomeAccount.id!,
            account: incomeAccount,
            amount: commissionAmount,
            isCredit: true,
            type: EntryType.gameResolve,
            meta: {
              type: EntryType.gameResolve,
              gameId,
              gameType: GameTypeEnum.UPDOWN,
            },
          }),
        );
      }

      return this.journalService.save(journal, dbTransaction);
    }
    return;
  }

  public async createLedgerEntriesForBTCx1000(
    gameId: string,
    bet: Bet,
    dbTransaction: PrismaTransaction,
  ) {
    const journal = new LedgerJournalEntity({
      entries: [],
      name: `Game BTC x1000 Resolve with 1 bets for ${bet.amount.toNumber()} usd`,
    });

    const userAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.userBalance,
        bet.ownerId,
      ]),
    );

    const fundsAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Income,
        IncomeAccounts.funds,
        FundsAccounts.x1000,
      ]),
    );

    const betsLiabilityAccount = await this.accountService.findOrCreateAccount(
      resolveAccountName([
        AccountNames.Liabilities,
        LiabilitiesAccounts.bets,
        gameId,
      ]),
    );

    if (bet.outcome!.greaterThan(0)) {
      journal.addEntry(
        new LedgerEntryEntity({
          accountId: betsLiabilityAccount.id!,
          amount: bet.amount,
          account: betsLiabilityAccount,
          isCredit: false,
          type: EntryType.gameResolve,
          meta: {
            type: EntryType.gameResolve,
            gameId,
            gameType: GameTypeEnum.X1000,
          },
        }),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: fundsAccount.id!,
          amount: bet.pnl!,
          account: fundsAccount,
          isCredit: false,
          type: EntryType.userWon,
          meta: {
            type: EntryType.userWon,
            gameId,
            gameType: GameTypeEnum.X1000,
            betId: bet.id,
          },
        }),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: userAccount.id!,
          amount: bet.outcome!,
          isCredit: true,
          account: userAccount,
          type: EntryType.userWon,
          meta: {
            type: EntryType.userWon,
            gameId,
            gameType: GameTypeEnum.X1000,
            betId: bet.id,
          },
        }),
      );
    } else {
      journal.addEntry(
        new LedgerEntryEntity({
          accountId: betsLiabilityAccount.id!,
          amount: bet.amount,
          isCredit: false,
          type: EntryType.gameResolve,
          account: betsLiabilityAccount,
          meta: {
            type: EntryType.gameResolve,
            gameId,
            gameType: GameTypeEnum.X1000,
          },
        }),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: userAccount.id!,
          amount: new Decimal(0),
          isCredit: false,
          isRead: true,
          account: userAccount,
          type: EntryType.userLose,
          meta: {
            type: EntryType.userLose,
            gameId,
            loseAmount: Number(bet.amount),
            betId: bet.id,
            gameType: GameTypeEnum.X1000,
          },
        }),
      );

      journal.addEntry(
        new LedgerEntryEntity({
          accountId: fundsAccount.id!,
          amount: bet.amount,
          isCredit: true,
          account: fundsAccount,
          type: EntryType.userLose,
          meta: {
            type: EntryType.userLose,
            gameId,
            loseAmount: Number(bet.amount),
            gameType: GameTypeEnum.X1000,
            betId: bet.id,
          },
        }),
      );
    }

    return this.journalService.save(journal, dbTransaction);
  }
}
