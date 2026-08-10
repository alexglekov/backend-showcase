import {
  Bet,
  BetResultEnum,
  BetUpDown,
  GameUpDown,
} from '@prisma/client';
import { Decimal } from 'decimal.js';

type GameWithBets = GameUpDown & { bets: BetUpDown[] };

export function getUpDownGameResults(
  game: GameWithBets,
  platformFee: number
) {
  const bets = game.bets;
  const stopBetsPrice = game.startPrice;
  const latestPrice = game.endPrice;

  const winners: Bet[] = [];
  const losers: Bet[] = [];
  const rejects: Bet[] = [];

  if (!latestPrice || !stopBetsPrice) {
    rejects.push(...bets);
  } else if (latestPrice.equals(stopBetsPrice)) {
    rejects.push(...bets);
  } else if (bets.every((bet, _, array) => bet.isUp === array[0].isUp)) {
    rejects.push(...bets);
  } else {
    let upPoolAmount = new Decimal(0);
    let downPoolAmount = new Decimal(0);
    for (const bet of bets) {
      if (bet.isUp) {
        upPoolAmount = upPoolAmount.add(bet.amount);
      } else {
        downPoolAmount = downPoolAmount.add(bet.amount);
      }
      if (game.isUp) {
        if (bet.isUp) {
          winners.push(bet);
        } else {
          losers.push(bet);
        }
      } else {
        if (bet.isUp) {
          losers.push(bet);
        } else {
          winners.push(bet);
        }
      }
    }
    const winnerPool = game.isUp ? upPoolAmount : downPoolAmount;
    const lostPool = game.isUp ? downPoolAmount : upPoolAmount;

    for (const winner of winners) {
      const percent = new Decimal(winner.amount || 0).div(winnerPool);
      const winAmount = new Decimal(lostPool).mul(percent);
      const fee = winAmount.mul(platformFee);

      winner.result = BetResultEnum.WON;
      winner.fee = fee;
      winner.pnl = winAmount.minus(winner.fee);
      winner.outcome = winner.amount.plus(winner.pnl);
      winner.multiplier = Number(winner.pnl.div(winner.amount));
    }
    for (const loser of losers) {
      loser.result = BetResultEnum.LOSS;
      loser.fee = new Decimal(0);
      loser.pnl = loser.amount.negated();
      loser.outcome = new Decimal(0);
    }
  }
  for (const rejected of rejects) {
    rejected.result = BetResultEnum.REJECT;
    rejected.fee = new Decimal(0);
    rejected.pnl = new Decimal(0);
    rejected.outcome = new Decimal(0);
  }

  return {
    winners,
    losers,
    rejects,
  };
}
