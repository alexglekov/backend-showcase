import { BetBullseye, BetResultEnum } from '@prisma/client';
import { Decimal } from 'decimal.js';

const testAccuracyLevel = 0.01;

const exactWinnerCoefficients = {
  firstPlace: 0.75,
  secondPlace: 0.15,
  thirdPlace: 0.10,
  twoParticipantsCase: {
    firstPlace: 0.80,
    secondPlace: 0.20,
  },
};

const defaultWinnerCoefficients = {
  firstPlace: 0.50,
  secondPlace: 0.35,
  thirdPlace: 0.15,
  twoParticipantsCase: {
    firstPlace: 0.75,
    secondPlace: 0.25,
  },
};

const testEndPrice = new Decimal(47957.1812);

export const getGamePoolFixtureCase1 = () => {
  return {
    fixture: {  
      bets: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47960.5616),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          price: new Decimal(47958.7059),
        },
      ] as BetBullseye[],
      endPrice: testEndPrice,
      platformFee: 0.01,
      accuracyLevel: testAccuracyLevel,
      exactWinnerCoefficients,
      defaultWinnerCoefficients
    },
    expectedResult: {
      losers: [],
      rejects: [],
      winners: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          fee: new Decimal(1.6),
          isExact: true,
          outcome: new Decimal(158.4),
          pnl: new Decimal(58.4),
          price: new Decimal(47958.7059),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 1,
          multiplier: 0.584,
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          fee: new Decimal(0.4),
          isExact: false,
          outcome: new Decimal(39.6),
          pnl: new Decimal(-60.4),
          price: new Decimal(47960.5616),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 2,
          multiplier: -0.604,
        },
      ],
    },
  }
}

export const getGamePoolFixtureCase2 = () => {
  return {
    fixture: {
      bets: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47961.4249),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          price: new Decimal(48136.3178),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:18:12.753Z"),
          price: new Decimal(47953.4847),
        },
      ] as BetBullseye[],
      endPrice: testEndPrice,
      platformFee: 0.01,
      accuracyLevel: testAccuracyLevel,
      exactWinnerCoefficients,
      defaultWinnerCoefficients
    },
    expectedResult: {
      losers: [],
      rejects: [],
      winners: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:18:12.753Z"),
          fee: new Decimal(2.25),
          isExact: true,
          outcome: new Decimal(222.75),
          pnl: new Decimal(122.75),
          price: new Decimal(47953.4847),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 1,
          multiplier: 1.2275,
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          fee: new Decimal(0.45),
          isExact: false,
          outcome: new Decimal(44.55),
          pnl: new Decimal(-55.45),
          price: new Decimal(47961.4249),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 2,
          multiplier: -0.5545,
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          fee: new Decimal(0.3),
          isExact: false,
          outcome: new Decimal(29.7),
          pnl: new Decimal(-70.3),
          price: new Decimal(48136.3178),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 3,
          multiplier: -0.703,
        },
      ],
    },
  }
}

export const getGamePoolFixtureCase3 = () => {
  return {
    fixture: {
      bets: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47959.9967),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          price: new Decimal(47901.5225),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:18:12.753Z"),
          price: new Decimal(47953.1752),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:19:12.753Z"),
          price: new Decimal(47955.5686),
        },
      ] as BetBullseye[],
      endPrice: testEndPrice,
      platformFee: 0.01,
      accuracyLevel: testAccuracyLevel,
      exactWinnerCoefficients,
      defaultWinnerCoefficients
    },
    expectedResult: {
      losers: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          fee: new Decimal(0),
          isExact: false,
          outcome: new Decimal(0),
          pnl: new Decimal(-100),
          price: new Decimal(47901.5225),
          priceResult: testEndPrice,
          result: BetResultEnum.LOSS,
          place: 4,
        },
      ],
      rejects: [],
      winners: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:19:12.753Z"),
          fee: new Decimal(3),
          isExact: true,
          outcome: new Decimal(297),
          pnl: new Decimal(197),
          price: new Decimal(47955.5686),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 1,
          multiplier: 1.97,
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          fee: new Decimal(0.6),
          isExact: false,
          outcome: new Decimal(59.4),
          pnl: new Decimal(-40.6),
          price: new Decimal(47959.9967),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 2,
          multiplier: -0.406,
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:18:12.753Z"),
          fee: new Decimal(0.4),
          isExact: false,
          outcome: new Decimal(39.6),
          pnl: new Decimal(-60.4),
          price: new Decimal(47953.1752),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 3,
          multiplier: -0.604,
        },
      ],
    },
  }
}

export const getGamePoolFixtureCase4 = () => {
  return {
    fixture: {
      bets: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47960.5616),
        },
      ] as BetBullseye[],
      endPrice: testEndPrice,
      platformFee: 0.01,
      accuracyLevel: testAccuracyLevel,
      exactWinnerCoefficients,
      defaultWinnerCoefficients
    },
    expectedResult: {
      losers: [],
      rejects: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47960.5616),
          isExact: false,
          fee: new Decimal(0),
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          priceResult: null,
          result: BetResultEnum.REJECT,
        },
      ],
      winners: [],
    },
  }
}

export const getGamePoolFixtureCase5 = () => {
  return {
    fixture: {
      bets: [] as BetBullseye[],
      endPrice: testEndPrice,
      platformFee: 0.01,
      accuracyLevel: testAccuracyLevel,
      exactWinnerCoefficients,
      defaultWinnerCoefficients
    },
    expectedResult: {
      losers: [],
      rejects: [],
      winners: [],
    },
  }
}

export const getGamePoolFixtureCase6 = () => {
  return {
    fixture: {
      bets: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47955.5686),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          price: new Decimal(47901.5225),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:18:12.753Z"),
          price: new Decimal(47953.1752),
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:19:12.753Z"),
          price: new Decimal(47955.5686),
        },
      ] as BetBullseye[],
      endPrice: testEndPrice,
      platformFee: 0.01,
      accuracyLevel: testAccuracyLevel,
      exactWinnerCoefficients,
      defaultWinnerCoefficients
    },
    expectedResult: {
      losers: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:17:12.753Z"),
          fee: new Decimal(0),
          isExact: false,
          outcome: new Decimal(0),
          pnl: new Decimal(-100),
          price: new Decimal(47901.5225),
          priceResult: testEndPrice,
          result: BetResultEnum.LOSS,
          place: 4,
        },
      ],
      rejects: [],
      winners: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          fee: new Decimal(3),
          isExact: true,
          outcome: new Decimal(297),
          pnl: new Decimal(197),
          price: new Decimal(47955.5686),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 1,
          multiplier: 1.97,
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:19:12.753Z"),
          fee: new Decimal(0.6),
          isExact: false,
          outcome: new Decimal(59.4),
          pnl: new Decimal(-40.6),
          price: new Decimal(47955.5686),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 2,
          multiplier: -0.406,
        },
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:18:12.753Z"),
          fee: new Decimal(0.4),
          isExact: false,
          outcome: new Decimal(39.6),
          pnl: new Decimal(-60.4),
          price: new Decimal(47953.1752),
          priceResult: testEndPrice,
          result: BetResultEnum.WON,
          place: 3,
          multiplier: -0.604,
        },
      ],
    },
  }
}

export const getGamePoolFixtureCase7 = () => {
  return {
    fixture: {
      bets: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47960.5616),
        },
      ] as BetBullseye[],
      endPrice: null,
      platformFee: 0.01,
      accuracyLevel: testAccuracyLevel,
      exactWinnerCoefficients,
      defaultWinnerCoefficients
    },
    expectedResult: {
      losers: [],
      rejects: [
        {
          amount: new Decimal(100),
          createdAt: new Date("2024-02-11T14:16:12.753Z"),
          price: new Decimal(47960.5616),
          isExact: false,
          fee: new Decimal(0),
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          priceResult: null,
          result: BetResultEnum.REJECT,
        },
      ],
      winners: [],
    },
  }
}
