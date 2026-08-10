import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Bet, BetResultEnum, BetTypeEnum } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { OneVsOneBetChangedDomainEventPayload } from '@xyro/contracts/one-vs-one';
import { SetupBetChangedDomainEventPayload } from '@xyro/contracts/setups';
import { UpDownBetChangedDomainEventPayload } from '@xyro/contracts/up-down';
import { X1000BetChangedDomainEventPayload } from '@xyro/contracts/x1000';
import { BullsEyeBetChangedDomainEventPayload } from '@xyro/contracts/bulls-eye';
import {
  HighWagerBetCreatedDomainEvent,
  HighestPnlBetCreatedDomainEvent,
  LuckyBetCreatedDomainEvent
} from '@xyro/contracts/analytics';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { LoggerService } from '@xyro/libs/logger';

import { PrismaService } from '../../../infrastructure/prisma';

type BetChangedPayloads = 
  | OneVsOneBetChangedDomainEventPayload
  | SetupBetChangedDomainEventPayload
  | UpDownBetChangedDomainEventPayload
  | X1000BetChangedDomainEventPayload
  | BullsEyeBetChangedDomainEventPayload
;

const MAX_COUNT_BETS = 10;

@Injectable()
export class LiveStreamOfBetsService implements OnModuleInit {
  private readonly lastLuckyBets: Bet[] = [];
  private readonly lastHighWagerBets: Bet[] = [];
  private readonly lastHighestPnlBets: Bet[] = [];

  private closedBets: BetChangedPayloads[] = [];

  constructor(
    private readonly logger: LoggerService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly prismaService: PrismaService,
  ) {
    this.logger.setContext(LiveStreamOfBetsService.name);
  }

  async onModuleInit() {
    const [
      highWagerBets,
      highestPnlBets,
      luckyBets,
    ] = await Promise.all([
      this.prismaService.bet.findMany({
        where: {
          result: BetResultEnum.WON,
        },
        orderBy: [
          {
            updatedAt: 'desc',
          },
          {
            amount: 'desc',
          }
        ],
        take: MAX_COUNT_BETS,
      }),
      this.prismaService.bet.findMany({
        where: {
          result: BetResultEnum.WON,
        },
        orderBy: [
          {
            updatedAt: 'desc',
          },
          {
            pnl: 'desc',
          }
        ],
        take: MAX_COUNT_BETS,
      }),
      this.prismaService.bet.findMany({
        where: {
          result: BetResultEnum.WON,
        },
        orderBy: [
          {
            updatedAt: 'desc',
          },
          {
            multiplier: 'desc',
          }
        ],
        take: MAX_COUNT_BETS,
      }),
    ]);

    luckyBets
      .reverse()
      .forEach((bet) => this.pushLuckyBet(bet));
    highWagerBets
      .reverse()
      .forEach((bet) => this.pushHighWagerBet(bet));
    highestPnlBets
      .reverse()
      .forEach((bet) => this.pushHighestPnlBet(bet));
  }

  public getLuckyBets() {
    return this.lastLuckyBets;
  }

  public getHighWagerBets() {
    return this.lastHighWagerBets;
  }

  public getHighestPnlBets() {
    return this.lastHighestPnlBets;
  }

  async onBetChanged(payload: BetChangedPayloads) {
    if (!this.shouldHandleBet(payload)) return;

    this.closedBets.push(payload);
    this.pushHighestPnlBet(this.mapPayloadToBet(payload));

    await this.domainEventsPublisher.publish(
      new HighestPnlBetCreatedDomainEvent(this.mapPayloadToBet(payload)),
    );
  }

  private shouldHandleBet(payload: BetChangedPayloads) {
    return payload.result === BetResultEnum.WON;
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleBets() {
    const createdBets = this.closedBets;
    this.closedBets = [];

    this.logger.log({
      action: "LiveStreamOfBetsService cron job handleBets",
      payload: {
        amountClosedBets: createdBets.length,
      }
    });

    if (createdBets.length === 0) return;

    const highWagerBet = this.foundBetByPredicate(createdBets, this.highWagerPredicate.bind(this));
    const luckyBet = this.foundBetByPredicate(createdBets, this.luckyBetPredicate.bind(this));

    this.pushHighWagerBet(this.mapPayloadToBet(highWagerBet));
    this.pushLuckyBet(this.mapPayloadToBet(luckyBet));

    await Promise.allSettled([
      this.domainEventsPublisher.publish(
        new HighWagerBetCreatedDomainEvent(this.mapPayloadToBet(highWagerBet))
      ),
      this.domainEventsPublisher.publish(
        new LuckyBetCreatedDomainEvent(this.mapPayloadToBet(luckyBet))
      ),
    ]);
  }

  private pushLuckyBet(bet: Bet) {
    if (this.lastLuckyBets.length === MAX_COUNT_BETS) this.lastLuckyBets.pop();
    this.lastLuckyBets.unshift(bet);
  }

  private pushHighWagerBet(bet: Bet) {
    if (this.lastHighWagerBets.length === MAX_COUNT_BETS) this.lastHighWagerBets.pop();
    this.lastHighWagerBets.unshift(bet);
  }

  private pushHighestPnlBet(bet: Bet) {
    if (this.lastHighestPnlBets.length === MAX_COUNT_BETS) this.lastHighestPnlBets.pop();
    this.lastHighestPnlBets.unshift(bet);
  }

  private foundBetByPredicate(
    bets: BetChangedPayloads[],
    predicate: (currentHighestBet: BetChangedPayloads, bet: BetChangedPayloads) => boolean
  ): BetChangedPayloads {
    return bets.reduce((currentHighestBet, bet) => predicate(currentHighestBet, bet) ? bet : currentHighestBet);
  }

  private highWagerPredicate(currentHighestBet: BetChangedPayloads, bet: BetChangedPayloads): boolean {
    return new Decimal(bet.amount).greaterThan(currentHighestBet.amount);
  }

  private luckyBetPredicate(currentHighestBet: BetChangedPayloads, bet: BetChangedPayloads): boolean {
    return new Decimal(bet.multiplier).greaterThan(new Decimal(currentHighestBet.multiplier));
  }

  private highestPnlPredicate(currentHighestBet: BetChangedPayloads, bet: BetChangedPayloads): boolean {
    return new Decimal(bet.pnl || 0).greaterThan(currentHighestBet.pnl || 0);
  }

  // TODO: https://linear.app/xyro/issue/BE-244
  private mapPayloadToBet(payload: BetChangedPayloads): Bet {
    return {
      id: payload.id,
      gameType: payload.gameType,
      gameId: payload.gameId,
      ownerId: payload.ownerId,
      type: payload.type as BetTypeEnum,
      amount: new Decimal(payload.amount),
      fee: payload.fee ? new Decimal(payload.fee) : null,
      pnl: payload.pnl ? new Decimal(payload.pnl) : null,
      result: payload.result as BetResultEnum,
      outcome: payload.outcome ? new Decimal(payload.outcome) : null,
      price: payload.price ? new Decimal(payload.price) : null,
      isUp: typeof payload.isUp === 'boolean' ? payload.isUp : null,
      priceResult: payload.priceResult ? new Decimal(payload.priceResult) : null,
      isUpResult: typeof payload.isUpResult === 'boolean' ? payload.isUpResult : null,
      createdAt: new Date(payload.createdAt),
      updatedAt: new Date(payload.updatedAt),
      multiplier: Number(payload.multiplier),
    }
  }
}