import { Balance, Reward } from '@prisma/client';

export type RewardWithBalance = Reward & {
  balance?: Pick<Balance, 'amount'>;
};
