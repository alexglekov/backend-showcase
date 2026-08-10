import { Bet1vs1, BetResultEnum, Game1vs1 } from '@prisma/client';
import { Decimal } from 'decimal.js';

type GetOneVsOneGameStateParams = {
  game: Game1vs1 & {
    bets?: Bet1vs1[];
  };
};

type GetOneVsOneGameResultParams = {
  game: Game1vs1 & {
    bets: Bet1vs1[];
  };
  platformFee: number;
};

type GetOneVsOneGameStateResult = {
  id: string;
  assetId: string;
  timeframe: number;
  state: string;
  startPrice: number;
  endPrice?: number;
  stopBetsAt: Date;
  isPrivate: boolean;
  endAt: Date;
  startAt: Date;
  createdAt: string;
  updatedAt: string;
};

type GetOneVsOneBetStateResult = {
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
  multiplier: number;
};

export function getOneVsOneBetState(
  bet: Bet1vs1
): GetOneVsOneBetStateResult {
  return {
    id: bet.id,
    gameId: bet.gameId,
    ownerId: bet.ownerId,
    type: bet.type,
    amount: Number(bet.amount),
    result: bet.result,
    createdAt: new Date(bet.createdAt).toISOString(),
    updatedAt: new Date(bet.updatedAt).toISOString(),
    fee: bet.fee ? Number(bet.fee) : undefined,
    pnl: bet.pnl ? Number(bet.pnl) : undefined,
    outcome: bet.outcome ? Number(bet.outcome) : undefined,
    price: bet.price ? Number(bet.price) : undefined,
    priceResult: bet.priceResult ? Number(bet.priceResult) : undefined,
    isUp: typeof bet.isUp === 'boolean' ? bet.isUp : undefined,
    isUpResult: typeof bet.isUpResult === 'boolean' ? bet.isUpResult : undefined,
    multiplier: Number(bet.multiplier),
  };
}

export function getOneVsOneGameState(
  params: GetOneVsOneGameStateParams
): GetOneVsOneGameStateResult {
  const { game } = params;

  return {
    id: game.id,
    assetId: game.assetId,
    timeframe: game.timeframe,
    state: game.state,
    startPrice: Number(game.startPrice),
    endPrice: game.endPrice ? Number(game.endPrice) : undefined,
    stopBetsAt: game.stopBetsAt!,
    endAt: game.endAt!,
    startAt: game.startAt!,
    isPrivate: game.isPrivate,
    createdAt: game.createdAt.toISOString(),
    updatedAt: game.updatedAt.toISOString(),
  };
}

export function getOneVsOneGameResults(params: GetOneVsOneGameResultParams) {
  const { game, platformFee } = params;
  const { bets } = game;

  if (!game.endPrice || bets.length === 1) {
    for (const bet of bets) {
      bet.result = BetResultEnum.REJECT;
      bet.fee = new Decimal(0);
      bet.pnl = new Decimal(0);
      bet.outcome = new Decimal(0);
    }

    return {
      winners: [],
      losers: [],
      rejects: [bets[0]],
    };
  }

  const [player1, player2] = bets;

  let winner: Bet1vs1, loser: Bet1vs1;

  if (game.isExact) {
    if (
      player1
        .price!.minus(game.endPrice)
        .abs()
        .lessThan(player2.price!.minus(game.endPrice).abs())
    ) {
      winner = player1;
      loser = player2;
    } else {
      winner = player2;
      loser = player1;
    }
  } else {
    if (game.endPrice!.greaterThan(game.startPrice!) && player1.isUp) {
      winner = player1;
      loser = player2;
    } else {
      winner = player2;
      loser = player1;
    }
  }

  winner.result = BetResultEnum.WON;
  winner.fee = loser.amount.mul(platformFee);
  winner.pnl = loser.amount.minus(winner.fee);
  winner.outcome = winner.amount.plus(winner.pnl);
  winner.multiplier = Number(winner.pnl.div(winner.amount));

  loser.result = BetResultEnum.LOSS;
  loser.fee = new Decimal(0);
  loser.pnl = loser.amount.negated();
  loser.outcome = new Decimal(0);

  return {
    winners: [winner],
    losers: [loser],
    rejects: [],
  };
}
