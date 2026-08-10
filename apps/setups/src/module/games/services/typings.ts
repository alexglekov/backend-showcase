import { GameSetup } from '@prisma/client';

export type TSetupGamePoolInfo = {
  amount: number;
  count: number;
  multiplier: number;
}

export type TSetupGamePoolsInfo = {
  takeProfitPool: TSetupGamePoolInfo;
  stopLossPool: TSetupGamePoolInfo;
}

export type TSetupGameWithPoolsEnfo = GameSetup & TSetupGamePoolsInfo;
