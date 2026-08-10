import { Prisma } from '@prisma/client';

export const season: Prisma.SeasonCreateInput = {
  id: 'season1',
  name: 'Beta Testing',
  description: 'Welcome to the XYRO Beta Testing Journey! Dive into Phase 1, where you can test all Game Modes and earn points through for the Competitive Airdrop Stage 1 by playing games and completing tasks in Rewards System!',
  active: true,
};
