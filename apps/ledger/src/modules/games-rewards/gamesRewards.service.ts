import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Bet, BetResultEnum, GameStateEnum, GameTypeEnum, Prisma } from '@prisma/client';
import { BaseGameEntity } from '@xyro/core';
import { AccountNames, GameLedgerService, LedgerJournalEntity, LiabilitiesAccounts, WalletLedgerService, resolveAccountName } from '@xyro/libs/ledger';
import { SetupGameEntity } from '@xyro/contracts/setups';
import { UpDownGameEntity } from '@xyro/contracts/up-down';
import { X1000GameEntity } from '@xyro/contracts/x1000';
import { BullsEyeGameEntity } from '@xyro/contracts/bulls-eye';
import { OneVsOneGameEntity } from '@xyro/contracts/one-vs-one';
import Decimal from 'decimal.js';
import { BalanceUpdatedDomainEvent } from '@xyro/contracts/ledger';
import { DomainEventsPublisher } from '@xyro/libs/events';

import { DBTransaction, PrismaService } from '../../infrastructure/prisma';

@Injectable()
export class GamesRewardsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly ledgerService: GameLedgerService,
    private readonly walletLedgerService: WalletLedgerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
  ) {}

  async giveRewardsForX1000Game(game: X1000GameEntity) {
    if (game.state !== GameStateEnum.CLOSE) return;
    const [bet] = await this.getParticipantsOfTheGame(game);

    const updatedBalances = await this.prismaService.$transaction(
      async (dbTransaction) => {
        const journal = await this.ledgerService.createLedgerEntriesForBTCx1000(
          game.id,
          bet,
          dbTransaction,
        );

        if (!journal) return;

        return this.updateUsersBalances(journal, dbTransaction);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );

    if (updatedBalances) await Promise.allSettled(
      updatedBalances.map((updatedBalance) => this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      ))
    )
  }

  async giveRewardsForUpDownGame(game: UpDownGameEntity) {
    if (game.state !== GameStateEnum.CLOSE) return;
    const bets = await this.getParticipantsOfTheGame(game);

    const results = this.getGameResults(bets);

    const updatedBalances = await this.prismaService.$transaction(
      async (dbTransaction) => {
        const journal = await this.ledgerService.createLedgerEntriesForUpDown(
          {
            ...results,
            gameId: game.id,
          },
          dbTransaction,
        );

        if (!journal) return;


        return this.updateUsersBalances(journal, dbTransaction);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
    );

    if (updatedBalances) await Promise.allSettled(
      updatedBalances.map((updatedBalance) => this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      ))
    )
  }

  async giveRewardsForSetups(game: SetupGameEntity) {
    if (game.state !== GameStateEnum.CLOSE) return;
    const bets = await this.getParticipantsOfTheGame(game);

    const results = this.getGameResults(bets);

    // influencer also has profit from completed game
    if (results.rejects.length === 0) {
      results.winners.push({
        ownerId: game.ownerId,
        amount: new Decimal(0),
        outcome: new Decimal(game.ownerProfit || 0),
        pnl: new Decimal(game.ownerProfit || 0),
        fee: new Decimal(0),
        gameId: game.id,
      } as Bet);
    }

    const updatedBalances = await this.prismaService.$transaction(
      async (dbTransaction) => {
        const journal = await this.ledgerService.createLedgerEntriesForSetup(
          {
            ...results,
            gameId: game.id,
          },
          dbTransaction,
        );

        if (!journal) return;

        return this.updateUsersBalances(journal, dbTransaction);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
    );

    if (updatedBalances) await Promise.allSettled(
      updatedBalances.map((updatedBalance) => this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      ))
    )
  }

  async giveRewardsForOneVsOne(game: OneVsOneGameEntity) {
    if (game.state !== GameStateEnum.CLOSE) return;
    const bets = await this.getParticipantsOfTheGame(game);

    const results = this.getGameResults(bets);

    const updatedBalances = await this.prismaService.$transaction(
      async (dbTransaction) => {
        const journal = await this.ledgerService.createLedgerEntriesForOneVsOne(
          {
            ...results,
            gameId: game.id,
          },
          dbTransaction,
        );

        if (!journal) return;

        return this.updateUsersBalances(journal, dbTransaction);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );

    if (updatedBalances) await Promise.allSettled(
      updatedBalances.map((updatedBalance) => this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      ))
    )
  }

  async giveRewardsForBullsEye(game: BullsEyeGameEntity) {
    if (game.state !== GameStateEnum.CLOSE) return;
    const bets = await this.getParticipantsOfTheGame(game);

    const results = this.getGameResults(bets);

    const updatedBalances = await this.prismaService.$transaction(
      async (dbTransaction) => {
        const journal = await this.ledgerService.createLedgerEntriesForBullsEye(
          {
            ...results,
            gameId: game.id,
          },
          dbTransaction,
        );

        if (!journal) return;

        return this.updateUsersBalances(journal, dbTransaction);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead }
    );

    if (updatedBalances) await Promise.allSettled(
      updatedBalances.map((updatedBalance) => this.domainEventsPublisher.publish(
        new BalanceUpdatedDomainEvent({
          accountId: updatedBalance.accountId,
          amount: updatedBalance.amount,
          id: updatedBalance.id!,
          createdAt: updatedBalance.createdAt,
        })
      ))
    )
  }

  getGameResults(bets: Bet[]) {
    const losers: Bet[] = [];
    const rejects: Bet[] = [];
    const winners: Bet[] = [];
    bets.forEach((bet) => {
      if (bet.result === BetResultEnum.LOSS) losers.push(bet);
      else if (bet.result === BetResultEnum.WON) winners.push(bet);
      else if (bet.result === BetResultEnum.REJECT) rejects.push(bet);
    });
    return { losers, rejects, winners };
  }

  async getParticipantsOfTheGame(game: BaseGameEntity) {
    const where = { gameId: game.id };
    let bets;
    if (game.type === GameTypeEnum.UPDOWN) {
      bets = await this.prismaService.betUpDown.findMany({ where });
    } else if (game.type === GameTypeEnum.X1000) {
      bets = await this.prismaService.betX1000.findMany({ where });
    } else if (game.type === GameTypeEnum.SETUP) {
      bets = await this.prismaService.betSetup.findMany({ where });
    } else if (game.type === GameTypeEnum.BULLSEYE) {
      bets = await this.prismaService.betBullseye.findMany({ where });
    } else if (game.type === GameTypeEnum.ONEVSONE) {
      bets = await this.prismaService.bet1vs1.findMany({ where });
    } else {
      throw new InternalServerErrorException('Bet type not found');
    }
    return bets;
  }

  async updateUsersBalances(journal: LedgerJournalEntity, dbTransaction: DBTransaction) {
    const userAccounts = resolveAccountName([
      AccountNames.Liabilities,
      LiabilitiesAccounts.userBalance,
    ]);

    const updateBalances = new Map<string, Decimal>();

    for (const entry of journal.entries) {
      const account = entry.account;

      if (!account) throw new InternalServerErrorException('Account not provided for entry...');

      if (account.fullName.startsWith(userAccounts) && !entry.isRead) {
        const currentUpdateBalance = updateBalances.get(entry.accountId) ?? new Decimal(0);

        if (entry.isCredit) {
          if (account.isCreditPlus) {
            updateBalances.set(entry.accountId, currentUpdateBalance.add(new Decimal(entry.amount)));
          } else {
            updateBalances.set(entry.accountId, currentUpdateBalance.sub(new Decimal(entry.amount)));
          }
        } else {
          if (account.isCreditPlus) {
            updateBalances.set(entry.accountId, currentUpdateBalance.sub(new Decimal(entry.amount)));
          } else {
            updateBalances.set(entry.accountId, currentUpdateBalance.add(new Decimal(entry.amount)));
          }
        }
      }
    }

    const updatedBalances = await Promise.all(
      Array
        .from(updateBalances.entries())
        .map(
          ([accountId, currentUpdateBalance]) => this.walletLedgerService.updateBalanceByAccountAndJournal(
            accountId,
            currentUpdateBalance,
            journal,
            dbTransaction
          ),
        )
    );

    return updatedBalances;
  }
}
