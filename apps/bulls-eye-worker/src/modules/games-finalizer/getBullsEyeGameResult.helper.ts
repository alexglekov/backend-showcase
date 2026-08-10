import {
  BetBullseye,
  BetResultEnum,
} from '@prisma/client';
import { Decimal } from 'decimal.js';

interface WinnerCoefficients {
  firstPlace: number;
  secondPlace: number;
  thirdPlace: number;
  twoParticipantsCase: {
    firstPlace: number;
    secondPlace: number;
  }
}

type GetBullsEyeGameResultsParams = {
  bets: BetBullseye[];
  endPrice: Decimal | null;
  accuracyLevel: number;
  platformFee: number;
  exactWinnerCoefficients: WinnerCoefficients;
  defaultWinnerCoefficients: WinnerCoefficients;
}

const LOSER_PLACE_START_INDEX = 4; // 4 because index start with 0 and first 3 places already taken

function findBullsEyeGameWinner(
  bets: BetBullseye[],
  endPrice: Decimal,
): BetBullseye[] {
  return [...bets]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .sort((a, b) => Number((endPrice.minus(a.price!).abs()).minus(endPrice.minus(b.price!).abs())));
}

function isExactPrice(price: Decimal, endPrice: Decimal, accuracyLevel: Decimal) {
  const accuracy = new Decimal(endPrice)
  .abs()
  .div(price.abs())
  .mul(100)
  .minus(100)
  .abs();

  return accuracy.lessThan(accuracyLevel)
}

export function getBullsEyeGameResult(params: GetBullsEyeGameResultsParams) {
  const {
    bets,
    endPrice,
    accuracyLevel,
    defaultWinnerCoefficients,
    exactWinnerCoefficients,
    platformFee,
  } = params;

  if (bets.length < 2 || !endPrice) {
    return {
      winners: [] as BetBullseye[],
      losers: [] as BetBullseye[],
      rejects: bets.map((bet) => ({
        ...bet,
        result: BetResultEnum.REJECT,
        priceResult: null,
        fee: new Decimal(0),
        pnl: new Decimal(0),
        isExact: false,
        outcome: new Decimal(0),
      })),
    }
  }

  const [
    firstWinner,
    secondWinner,
    thirdWinner,
    ...losers
  ] = findBullsEyeGameWinner(bets, endPrice);

  const winners: BetBullseye[] = [];

  const isExactGame = isExactPrice(firstWinner.price!, endPrice, new Decimal(accuracyLevel));
  const winnersCoefficients = isExactGame ? exactWinnerCoefficients : defaultWinnerCoefficients;

  let poolAmount = new Decimal(0);
  for (const bet of bets) {
    poolAmount = poolAmount.add(bet.amount);
  }

  const firstWonPrize = poolAmount.mul(thirdWinner ? winnersCoefficients.firstPlace : winnersCoefficients.twoParticipantsCase.firstPlace);
  firstWinner.result = BetResultEnum.WON;
  firstWinner.priceResult = endPrice;
  firstWinner.fee = firstWonPrize.mul(platformFee);
  firstWinner.pnl = firstWonPrize.minus(firstWinner.amount).minus(firstWinner.fee);
  firstWinner.isExact = isExactPrice(firstWinner.price!, endPrice, new Decimal(accuracyLevel));
  firstWinner.outcome = firstWonPrize.minus(firstWinner.fee);
  firstWinner.place = 1;
  firstWinner.multiplier = Number(firstWinner.pnl.div(firstWinner.amount));

  if (thirdWinner) {
    const thirdWonPrize = poolAmount.mul(winnersCoefficients.thirdPlace);
    thirdWinner.result = BetResultEnum.WON;
    thirdWinner.priceResult = endPrice;
    thirdWinner.fee = thirdWonPrize.mul(platformFee);
    thirdWinner.pnl = thirdWonPrize.minus(thirdWinner.amount).minus(thirdWinner.fee);
    thirdWinner.isExact = false;
    thirdWinner.outcome = thirdWonPrize.minus(thirdWinner.fee);
    thirdWinner.place = 3;
    thirdWinner.multiplier = Number(thirdWinner.pnl.div(thirdWinner.amount));

    winners.unshift(thirdWinner);
  }

  if (secondWinner) {
    const secondWonPrize = poolAmount.mul(thirdWinner ? winnersCoefficients.secondPlace : winnersCoefficients.twoParticipantsCase.secondPlace);
    secondWinner.result = BetResultEnum.WON;
    secondWinner.priceResult = endPrice;
    secondWinner.fee = secondWonPrize.mul(platformFee);
    secondWinner.pnl = secondWonPrize.minus(secondWinner.amount).minus(secondWinner.fee);
    secondWinner.isExact = false;
    secondWinner.outcome = secondWonPrize.minus(secondWinner.fee);
    secondWinner.place = 2;
    secondWinner.multiplier = Number(secondWinner.pnl.div(secondWinner.amount));

    winners.unshift(secondWinner);
  }

  winners.unshift(firstWinner);

  for (let loserIndex = 0; loserIndex < losers.length; loserIndex++) {
    const loser = losers[loserIndex];
    loser.result = BetResultEnum.LOSS;
    loser.priceResult = endPrice;
    loser.isExact = false;
    loser.fee = new Decimal(0);
    loser.pnl = loser.amount.negated();
    loser.outcome = new Decimal(0);
    loser.place = loserIndex + LOSER_PLACE_START_INDEX;
  }

  return {
    winners,
    losers: losers,
    rejects: [] as BetBullseye[],
  };
}
