import {
  BetResultEnum,
  BetX1000,
  FeeTypeEnum,
  GameX1000,
} from '@prisma/client';
import { Decimal } from 'decimal.js';

type CheckAddX1000BetParamsPayload = {
  startPrice: number;
  multiplier: number;
  amount: number;
  isLong: boolean;
  takeProfit?: number;
  stopLoss?: number;
  maxBetAmount: number;
};

type GetX1000GameResultParams = {
  platformFee: number;
  game: GameX1000 & { bets: BetX1000[] };
};

type GetX1000BetStateResult = {
  id: string;
  gameId: string;
  ownerId: string;
  type: string;
  amount: number;
  result: string;
  updatedAt: string;
  createdAt: string;
  fee?: number;
  pnl?: number;
  outcome?: number;
  price?: number;
  isUp?: boolean;
  priceResult?: number;
  isUpResult?: boolean;
  feeType: string;
  multiplier: number;
  startAt: string;
  roi?: number;
  startPrice?: number;
  endPrice?: number;
  isLong: boolean;
  takeProfit?: number;
  stopLoss?: number;
  burnPrice?: number;
}

export function getX1000BetState(bet: BetX1000): GetX1000BetStateResult {
  return {
    id: bet.id,
    gameId: bet.gameId,
    ownerId: bet.ownerId,
    type: bet.type,
    amount: Number(bet.amount),
    result: bet.result,
    createdAt: new Date(bet.createdAt).toISOString(),
    fee: bet.fee ? Number(bet.fee) : undefined,
    pnl: bet.pnl ? Number(bet.pnl) : undefined,
    outcome: bet.outcome ? Number(bet.outcome) : undefined,
    price: bet.price ? Number(bet.price) : undefined,
    priceResult: bet.priceResult ? Number(bet.priceResult) : undefined,
    isUp: typeof bet.isUp === 'boolean' ? bet.isUp : undefined,
    isUpResult: typeof bet.isUpResult === 'boolean' ? bet.isUpResult : undefined,
    feeType: bet.feeType,
    multiplier: Number(bet.multiplier),
    startAt: new Date(bet.startAt).toISOString(),
    roi: bet.roi ? Number(bet.roi) : undefined,
    startPrice: bet.startPrice ? Number(bet.startPrice) : undefined,
    endPrice: bet.endPrice ? Number(bet.endPrice) : undefined,
    isLong: bet.isLong,
    takeProfit: bet.takeProfit ? Number(bet.takeProfit) : undefined,
    stopLoss: bet.stopLoss ? Number(bet.stopLoss) : undefined,
    burnPrice: bet.burnPrice ? Number(bet.burnPrice) : undefined,
    updatedAt: new Date(bet.updatedAt).toISOString(),
  };
}

export function getX1000GameState(game: GameX1000) {
  return {
    id: game.id,
    userId: game.ownerId,
    state: game.state,
    startPrice: game.startPrice ? Number(game.startPrice) : undefined,
    endPrice: game.endPrice ? Number(game.endPrice) : undefined,
    stopBetsAt: game.stopBetsAt || undefined,
    endAt: game.endAt || undefined,
    startAt: game.startAt!,
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  };
}

export function checkAddX1000BetParams(payload: CheckAddX1000BetParamsPayload) {

  let errorMessage: string | null = null;

  // if (new Decimal(payload.amount).mul(payload.multiplier).gt(payload.maxBetAmount)) {
  //   errorMessage = `Total amount must be 0 < multiplier * amount < ${payload.maxBetAmount}`;
  // }

  if (payload.isLong) {
    if (payload.takeProfit && payload.takeProfit <= payload.startPrice) {
      errorMessage = `Invalid take profit, must be more then ${payload.startPrice}`;
    }
    if (payload.stopLoss && payload.stopLoss >= payload.startPrice) {
      errorMessage = `Invalid stop loss, must be less then ${payload.startPrice}`;
    }
  } else {
    if (payload.takeProfit && payload.takeProfit >= payload.startPrice) {
      errorMessage = `Invalid take profit, must be less then ${payload.startPrice}`;
    }
    if (payload.stopLoss && payload.stopLoss <= payload.startPrice) {
      errorMessage = `Invalid stop loss, must be more then ${payload.startPrice}`;
    }
  }

  return { errorMessage, isBetValid: !Boolean(errorMessage) };
}

export function calculateX1000BetBurnPrice(
  startPrice: number,
  isLong: boolean,
  multiplier: number
) {
  const roi = new Decimal(-100);
  const sign = new Decimal(isLong ? 1 : -1);
  const priceMove = roi.div(sign.mul(multiplier));
  const endPrice = new Decimal(startPrice).mul(priceMove.div(100).add(1));
  return new Decimal(endPrice);
}

export function getX1000GameResult(params: GetX1000GameResultParams) {
  const { game, platformFee } = params;
  const { endPrice, startPrice, bets } = game;
  const [bet] = bets;

  let roi: Decimal = new Decimal(0);
  let result: BetResultEnum = BetResultEnum.REJECT;
  let outcome: Decimal = new Decimal(0);
  let pnl: Decimal = new Decimal(0);
  let fee: Decimal = new Decimal(0);

  if (startPrice && endPrice) {
    const priceMove = endPrice.minus(startPrice).div(startPrice);
    const priceMovePercentage = priceMove.mul(100);

    const isProfit = bet.isLong
      ? priceMove.greaterThanOrEqualTo(0)
      : priceMove.lessThanOrEqualTo(0);

    const sign = isProfit ? 1 : -1;

    const roiSupose = priceMovePercentage.abs().mul(sign).mul(bet.multiplier);
    roi = roiSupose.lessThan(-100) ? new Decimal(-100) : roiSupose;

    const wonAmount = roi.div(100).mul(bet.amount);

    if (roi.greaterThan(0)) {
      if (bet.feeType === FeeTypeEnum.PNL_FEE) {
        fee = wonAmount.mul(platformFee);
      }
    }

    pnl = wonAmount.minus(fee);
    outcome = pnl.add(bet.amount);

    result = pnl.lessThan(0) ? BetResultEnum.LOSS : BetResultEnum.WON;
  }

  return {
    resolvedBet: {
      ...bet,
      roi,
      result,
      outcome,
      pnl,
      fee: bet.feeType === FeeTypeEnum.PNL_FEE ? fee : bet.fee,
    } as BetX1000,
  };
}
