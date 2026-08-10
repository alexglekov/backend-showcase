import { BetResultEnum, BetSetup } from '@prisma/client';
import { Decimal } from 'decimal.js';;

const testPlatformFee = 0.01;
const testOwnerId = "7f5f28c8-28af-4458-9281-c587128f43fe";
const testId = "7f5f28c8-28af-4458-9281-c587128f43fe";
const testTakeProfit = new Decimal(51342.23);
const testStopLoss = new Decimal(51142.23);

// const testEndPrice = new Decimal(51242.23);

export const getGameParamsFixtureCase1 = () => {
  return {
    fixture: {
      bets: [] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testTakeProfit,
      stopLoss: testStopLoss,
      endPrice: new Decimal(51242.23),
      isLong: true,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(0),
        ownerId: testOwnerId,
        pnl: new Decimal(0),
      },
      losers: [],
      rejects: [],
      winners: [],
    },
  }
}

export const getGameParamsFixtureCase2 = () => {
  return {
    fixture: {
      bets: [
        {
          isUp: true,
          amount: new Decimal(50),
        },
        {
          isUp: true,
          amount: new Decimal(50),
        },
      ] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testTakeProfit,
      stopLoss: testStopLoss,
      endPrice: new Decimal(51442.23),
      isLong: true,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(0),
        ownerId: testOwnerId,
        pnl: new Decimal(0),
      },
      losers: [],
      rejects: [
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: true,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: true,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
      ],
      winners: [],
    },
  }
}

export const getGameParamsFixtureCase3 = () => {
  return {
    fixture: {
      bets: [
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: false,
          amount: new Decimal(50),
        },
      ] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testTakeProfit,
      stopLoss: testStopLoss,
      endPrice: new Decimal(51442.23),
      isLong: true,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(0),
        ownerId: testOwnerId,
        pnl: new Decimal(0),
      },
      losers: [],
      rejects: [
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
      ],
      winners: [],
    },
  }
}

export const getGameParamsFixtureCase4 = () => {
  return {
    fixture: {
      bets: [
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: true,
          amount: new Decimal(100),
        },
      ] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testTakeProfit,
      stopLoss: testStopLoss,
      endPrice: null,
      isLong: true,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(0),
        ownerId: testOwnerId,
        pnl: new Decimal(0),
      },
      losers: [],
      rejects: [
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(100),
          fee: new Decimal(0),
          isUp: true,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
      ],
      winners: [],
    },
  }
}

export const getGameParamsFixtureCase5 = () => {
  return {
    fixture: {
      bets: [
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: true,
          amount: new Decimal(100),
        },
      ] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testTakeProfit,
      stopLoss: testStopLoss,
      endPrice: new Decimal(51042.23),
      isLong: true,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(1),
        ownerId: testOwnerId,
        pnl: new Decimal(1),
      },
      losers: [
        {
          amount: new Decimal(100),
          fee: new Decimal(0),
          isUp: true,
          outcome: new Decimal(0),
          pnl: new Decimal(-100),
          result: BetResultEnum.LOSS,
        }
      ],
      rejects: [],
      winners: [
        {
          amount: new Decimal(50),
          fee: new Decimal(0.495),
          isUp: false,
          outcome: new Decimal(99.005),
          pnl: new Decimal(49.005),
          result: BetResultEnum.WON,
          multiplier: 0.9801,
        },
        {
          amount: new Decimal(50),
          fee: new Decimal(0.495),
          isUp: false,
          outcome: new Decimal(99.005),
          pnl: new Decimal(49.005),
          result: BetResultEnum.WON,
          multiplier: 0.9801,
        },
      ],
    },
  }
}

export const getGameParamsFixtureCase6 = () => {
  return {
    fixture: {
      bets: [
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: true,
          amount: new Decimal(100),
        },
      ] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testTakeProfit,
      stopLoss: testStopLoss,
      endPrice: new Decimal(51242.23),
      isLong: true,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(0),
        ownerId: testOwnerId,
        pnl: new Decimal(0),
      },
      losers: [],
      rejects: [
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(100),
          fee: new Decimal(0),
          isUp: true,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
      ],
      winners: [],
    },
  }
}

export const getGameParamsFixtureCase7 = () => {
  return {
    fixture: {
      bets: [
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: true,
          amount: new Decimal(100),
        },
      ] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testStopLoss,
      stopLoss: testTakeProfit,
      endPrice: new Decimal(51042.23),
      isLong: false,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(1),
        ownerId: testOwnerId,
        pnl: new Decimal(1),
      },
      losers: [
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(-50),
          result: BetResultEnum.LOSS,
        },
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(-50),
          result: BetResultEnum.LOSS,
        },
      ],
      rejects: [],
      winners: [
        {
          amount: new Decimal(100),
          fee: new Decimal(0.99),
          isUp: true,
          outcome: new Decimal(198.01),
          pnl: new Decimal(98.01),
          result: BetResultEnum.WON,
          multiplier: 0.9801,
        }
      ],
    },
  }
}

export const getGameParamsFixtureCase8 = () => {
  return {
    fixture: {
      bets: [
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: false,
          amount: new Decimal(50),
        },
        {
          isUp: true,
          amount: new Decimal(100),
        },
      ] as BetSetup[],
      platformFee: testPlatformFee,
      ownerId: testOwnerId,
      id: testId,
      takeProfit: testStopLoss,
      stopLoss: testTakeProfit,
      endPrice: new Decimal(51242.23),
      isLong: false,
    },
    expectedResult: {
      influencer: {
        amount: new Decimal(0),
        fee: new Decimal(0),
        gameId: testId,
        outcome: new Decimal(0),
        ownerId: testOwnerId,
        pnl: new Decimal(0),
      },
      losers: [],
      rejects: [
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(50),
          fee: new Decimal(0),
          isUp: false,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
        {
          amount: new Decimal(100),
          fee: new Decimal(0),
          isUp: true,
          outcome: new Decimal(0),
          pnl: new Decimal(0),
          result: BetResultEnum.REJECT,
        },
      ],
      winners: [],
    },
  }
}
