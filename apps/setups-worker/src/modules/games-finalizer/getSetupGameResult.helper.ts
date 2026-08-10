import {
  Bet,
  BetResultEnum,
  BetSetup,
  GameSetupResultEnum,
} from '@prisma/client';
import { Decimal } from 'decimal.js';

type GetSetupGameResultParams = {
  ownerId: string;
  id: string;
  endPrice: Decimal | null;
  takeProfit: Decimal;
  stopLoss: Decimal;
  platformFee: number;
  bets: BetSetup[];
  isLong: boolean;
};

export function getSetupGameResult(
  params: GetSetupGameResultParams,
) {
  const { bets, isLong, endPrice, takeProfit, stopLoss, platformFee } = params;

  const { isRejected } = isGameRejected(params);

  if (isRejected) {
    return {
      winners: [],
      losers: [],
      result: GameSetupResultEnum.REJECTED,
      rejects: bets.map(rejectBet),
      influencer: {
        ownerId: params.ownerId,
        amount: new Decimal(0),
        outcome: new Decimal(0),
        pnl: new Decimal(0),
        fee: new Decimal(0),
        gameId: params.id,
      } as Bet,
    }
  }

  const winners: Bet[] = [];
  const losers: Bet[] = [];
  const rejects: Bet[] = [];

  const resultPriceDirection = getPriceDirectionResult(isLong, endPrice!, takeProfit, stopLoss);

  let influencerFee = new Decimal(0);
  let takeProfitPoolAmount = new Decimal(0);
  let stopLossPoolAmount = new Decimal(0);

  for (const bet of bets) {
    if (bet.isUp) {
      takeProfitPoolAmount = takeProfitPoolAmount.add(bet.amount);
    } else {
      stopLossPoolAmount = stopLossPoolAmount.add(bet.amount);
    }

    if (resultPriceDirection === bet.isUp) {
      winners.push(bet);
    } else {
      losers.push(bet);
    }
  }
  const winnerPoolAmount = resultPriceDirection ? takeProfitPoolAmount : stopLossPoolAmount;
  let losersPoolAmount = resultPriceDirection ? stopLossPoolAmount : takeProfitPoolAmount;

  influencerFee = losersPoolAmount.mul(platformFee); // influencerFee === platformFee ?
  losersPoolAmount = losersPoolAmount.minus(influencerFee);

  for (const winner of winners) {
    const percent = new Decimal(winner.amount || 0).div(winnerPoolAmount);
    const winAmount = new Decimal(losersPoolAmount).mul(percent);
    const fee = winAmount.mul(platformFee);

    const pnl = winAmount.minus(fee);

    winner.result = BetResultEnum.WON;
    winner.fee = fee;
    winner.pnl = pnl;
    winner.outcome = winner.amount.plus(pnl);
    winner.multiplier = Number(pnl.div(winner.amount));
  }

  for (const loser of losers) {
    loser.result = BetResultEnum.LOSS;
    loser.fee = new Decimal(0);
    loser.pnl = loser.amount.negated();
    loser.outcome = new Decimal(0);
    loser.multiplier = 0;
  }

  return {
    winners,
    losers,
    result: resultPriceDirection ? GameSetupResultEnum.TAKE_PROFIT : GameSetupResultEnum.STOP_LOSS,
    rejects,
    influencer: {
      ownerId: params.ownerId,
      amount: new Decimal(0),
      outcome: new Decimal(influencerFee),
      pnl: new Decimal(influencerFee),
      fee: new Decimal(0),
      gameId: params.id,
    } as Bet,
  };
}

function rejectBet(bet: BetSetup): BetSetup {
  return {
    ...bet,
    result: BetResultEnum.REJECT,
    fee: new Decimal(0),
    pnl: new Decimal(0),
    outcome: new Decimal(0),
    multiplier: 0,
  };
}

function getPriceDirectionResult(isLong: boolean, endPrice: Decimal, takeProfit: Decimal, stopLoss: Decimal) {
  return isLong && new Decimal(takeProfit).lessThanOrEqualTo(endPrice!)
    || !isLong && new Decimal(stopLoss).greaterThanOrEqualTo(endPrice!);
}

function isGameRejected(params: GetSetupGameResultParams): {
  isRejected: boolean;
} {
  const { bets, endPrice, takeProfit, stopLoss, isLong } = params;
  let isRejected = false;

  if (!endPrice) {
    isRejected = true;
  }

  if (!isRejected && bets.every((bet, _, array) => bet.isUp === array[0].isUp)) {
    isRejected = true;
  }

  if (!isRejected && endPrice) {
    if (isLong) {
      isRejected = endPrice.lessThan(takeProfit) && endPrice.greaterThan(stopLoss);
    } else {
      isRejected = endPrice.greaterThan(takeProfit) && endPrice.lessThan(stopLoss);
    }
  }

  return {
    isRejected,
  }
}
