import { InternalServerErrorException } from '@nestjs/common';
import {
  BetBullseye,
  GameBullseye,
} from '@prisma/client';

type GetBullsEyeGamePoolInfoParams = Pick<GameBullseye, 'amount'> & {
  bets: Pick<BetBullseye, 'amount'>[];
};
type GetBullsEyeGamePoolInfoResult = {
  betsCount: number;
  poolAmount: number;
};

export type GetBullsEyeGameStateParams = GameBullseye & { bets: Pick<BetBullseye, 'amount'>[] };

type GetBullsEyeGamesStateParams = {
  games: GetBullsEyeGameStateParams[]
};

type GetBullsEyeBetStateResult = {
  id: string;
  gameId: string;
  ownerId: string;
  type: string;
  amount: number;
  result: string;
  isExact: boolean;
  fee?: number;
  pnl?: number;
  outcome?: number;
  price?: number;
  isUp?: boolean;
  priceResult?: number;
  isUpResult?: boolean;
  place?: number;
  createdAt: string;
  updatedAt: string;
  multiplier: number;
}

export function getBullsEyeBetState(bet: BetBullseye): GetBullsEyeBetStateResult {
  return {
    id: bet.id,
    place: bet.place || undefined,
    gameId: bet.gameId,
    ownerId: bet.ownerId,
    type: bet.type,
    amount: Number(bet.amount),
    result: bet.result,
    createdAt: new Date(bet.createdAt).toISOString(),
    updatedAt: new Date(bet.updatedAt).toISOString(),
    isExact: bet.isExact,
    fee: bet.fee ? Number(bet.fee) : undefined,
    pnl: bet.pnl ? Number(bet.pnl) : undefined,
    outcome: bet.outcome ? Number(bet.outcome) : undefined,
    price: bet.price ? Number(bet.price) : undefined,
    priceResult: bet.priceResult ? Number(bet.priceResult) : undefined,
    isUp: typeof bet.isUp === 'boolean' ? bet.isUp : undefined,
    isUpResult: typeof bet.isUpResult === 'boolean' ? bet.isUpResult : undefined,
    multiplier: Number(bet.multiplier),
  }
}

export function getBullsEyeGamePoolInfo({
  bets,
  amount,
}: GetBullsEyeGamePoolInfoParams): GetBullsEyeGamePoolInfoResult {
  let poolAmount = 0;

  for (const bet of bets) {
    poolAmount += Number(bet.amount);
  }

  return {
    betsCount: bets.length,
    poolAmount,
  };
}

export function getBullsEyeGameState(game: GetBullsEyeGameStateParams) {
  return {
    id: game.id,
    startPrice: Number(game.startPrice),
    endPrice: game.endPrice ? Number(game.endPrice) : undefined,
    state: game.state,
    stopBetsAt: game.stopBetsAt!,
    endAt: game.endAt!,
    startAt: game.startAt!,
    assetId: game.assetId,
    amount: Number(game.amount),
    timeframe: game.timeframe,
  };
}

export function getBullsEyeGamesState(params: GetBullsEyeGamesStateParams) {
  const { games } = params;

  if (!games.length) throw new InternalServerErrorException('Games list is empty')

  const [game] = games;

  return {
    games: games.map((oneGame) => ({
      id: oneGame.id,
      amount: Number(oneGame.amount),
      winnerBetId: oneGame.winnerBetId || undefined,
      pool: getBullsEyeGamePoolInfo(oneGame),
    })),
    meta: {
      assetId: game.assetId,
      state: game.state,
      timeframe: game.timeframe,
      startAt: game.startAt!,
      stopBetsAt: game.stopBetsAt!,
      endAt: game.endAt!,
      startPrice: Number(game.startPrice),
      endPrice: game.endPrice ? Number(game.endPrice) : undefined,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    }
  };
}
