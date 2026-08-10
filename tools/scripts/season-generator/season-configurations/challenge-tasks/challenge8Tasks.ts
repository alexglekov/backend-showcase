import { Prisma, ChallengeTaskPattern } from '@prisma/client';

import { season } from '../season';
import { theSocialTribeChallenge } from '../challenges';
import { challenge1Task6 } from './challenge1Tasks';
import { V } from './constants';

type Configuration = Record<string, any> & {
  dailyLoginAmout: number;
  postsLikesAmount: number;
  discordRoleId: string;
}

export const challenge8Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge8Task1',
  name: 'Supporter',
  description: `Log in daily for 3 days in a row;\nLike 3 Xyro posts on X/Twitter.`,
  number: 1,
  reward: V,
  configuration: {
    dailyLoginAmout: 3,
    postsLikesAmount: 3,
    discordRoleId: '',
  } as Configuration,
  pattern: ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE,
  challenge: {
    connect: {
      id: theSocialTribeChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge1Task6.id,
    }
  }
};

export const challenge8Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge8Task2',
  name: 'Advocate',
  description: `Log in daily for 7 days in a row;\nLike 7 Xyro posts on X/Twitter.`,
  number: 2,
  reward: V * 1.5,
  configuration: {
    dailyLoginAmout: 7,
    postsLikesAmount: 7,
    discordRoleId: '',
  } as Configuration,
  pattern: ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE,
  challenge: {
    connect: {
      id: theSocialTribeChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge8Task1.id,
    }
  }
};

export const challenge8Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge8Task3',
  name: 'Promoter',
  description: `Log in daily for 14 days in a row;\nLike 20 Xyro posts on X/Twitter.`,
  number: 3,
  reward: V * 2,
  configuration: {
    dailyLoginAmout: 14,
    postsLikesAmount: 20,
    discordRoleId: '',
  } as Configuration,
  pattern: ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE,
  challenge: {
    connect: {
      id: theSocialTribeChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge8Task2.id,
    }
  }
};

export const challenge8Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge8Task4',
  name: 'Ally',
  description: `Log in daily for 21 days in a row;\nLike 20 Xyro posts on X/Twitter.`,
  number: 4,
  reward: V * 2.5,
  configuration: {
    dailyLoginAmout: 14,
    postsLikesAmount: 20,
    discordRoleId: '',
  } as Configuration,
  pattern: ChallengeTaskPattern.SOCIAL_TRIBE_CHALLENGE,
  challenge: {
    connect: {
      id: theSocialTribeChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge8Task3.id,
    }
  }
};
