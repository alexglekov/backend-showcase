import { ChallengeTaskPattern, Prisma } from '@prisma/client';

import { theWayOfXYROChallenge } from '../challenges';
import { season } from '../season';
import { V } from './constants';

export const challenge1Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge1Task1',
  name: 'Web3 Challenge',
  description: `Connect your Web3 wallet to Xyro.`,
  number: 1,
  configuration: undefined,
  reward: V * 2,
  pattern: ChallengeTaskPattern.CONNECT_WALLET_CHALLENGE,
  challenge: {
    connect: {
      id: theWayOfXYROChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  }
};

export const challenge1Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge1Task2',
  name: 'Profile Challenge',
  description: `Complete your profile:\na. Name;\nb. Bio (at least 80 characters);\nc. Profile avatar.`,
  number: 2,
  configuration: undefined,
  reward: V * 1.5,
  pattern: ChallengeTaskPattern.ENRICH_PROFILE,
  challenge: {
    connect: {
      id: theWayOfXYROChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge1Task1.id,
    }
  }
};

export const challenge1Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge1Task3',
  name: 'X Challenge',
  description: `Link your X account to your Xyro profile:\na. Fill out the description in your X account;\nb. Add an avatar to X account;\nc. Link your X account.`,
  number: 3,
  reward: V * 2,
  configuration: undefined,
  pattern: ChallengeTaskPattern.CONNECT_WITH_X,
  challenge: {
    connect: {
      id: theWayOfXYROChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge1Task2.id,
    }
  }
};

export const challenge1Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge1Task4',
  name: 'Share Challenge',
  description: `Retweet post of XYRO https://x.com/xyro_io/status/1785687960123269289`,
  number: 4,
  reward: V * 2.5,
  configuration: {
    tweetId: '1785687960123269289',
  },
  pattern: ChallengeTaskPattern.SHARE_CHALLENGE,
  challenge: {
    connect: {
      id: theWayOfXYROChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge1Task3.id,
    }
  }
};

export const challenge1Task5: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge1Task5',
  name: 'Discord Challenge',
  description: `Link your Discord account to your Xyro profile.`,
  number: 5,
  reward: V * 2,
  configuration: undefined,
  pattern: ChallengeTaskPattern.DISCORD_CHALLENGE,
  challenge: {
    connect: {
      id: theWayOfXYROChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge1Task4.id,
    }
  }
};

export const challenge1Task6: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge1Task6',
  name: 'Community Challenge',
  description: `Join to the Xyro Discord server.`,
  number: 6,
  reward: V * 2.5,
  configuration: undefined,
  pattern: ChallengeTaskPattern.COMMUNITY_CHALLENGE,
  challenge: {
    connect: {
      id: theWayOfXYROChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge1Task5.id,
    }
  }
};