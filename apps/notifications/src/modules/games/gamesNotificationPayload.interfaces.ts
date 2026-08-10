import { BetResultEnum, GameTypeEnum } from '@prisma/client';

type BaseGameResultPayload = {
  gameType: GameTypeEnum;
}

export interface OneVsOneGameResultPayload extends BaseGameResultPayload {
  result: BetResultEnum;
  outcome?: number;
  amount?: number;
  opponentId?: string;
}

export interface SetupGameResultPayload extends BaseGameResultPayload {
  result: BetResultEnum;
  outcome?: number;
  amount?: number;
}

export interface X1000GameResultPayload extends BaseGameResultPayload {
  result: BetResultEnum;
  outcome?: number;
  amount?: number;
}

export interface BullsEyeGameResultPayload extends BaseGameResultPayload {
  winnerId?: string;
  winnerOutcome?: number;
  isExact?: boolean;
  result: BetResultEnum;
  outcome?: number;
  amount?: number;
}

export interface UpDownGameResultPayload extends BaseGameResultPayload {
  result: BetResultEnum;
  outcome?: number;
  amount?: number;
}