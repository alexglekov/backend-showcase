import { Prisma, ChallengeTaskPattern } from '@prisma/client';

import { season } from '../season';
import { theSharoooorsChallenge } from '../challenges';
import { challenge1Task6 } from './challenge1Tasks';
import { V } from './constants';

type Configuration = Record<string, any> & {
  countLikesOnTweets?: number;
  countTweets?: number;
}

export const challenge9Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge9Task1',
  name: 'Post Creator',
  description: `Post an invite link to Xyro on X tagging @xyro_io.`,
  number: 1,
  reward: V * 3,
  configuration: {
    countLikesOnTweets: undefined,
    countTweets: 1,
  } as Configuration,
  pattern: ChallengeTaskPattern.SHAROOOORS_CHALLENGE,
  challenge: {
    connect: {
      id: theSharoooorsChallenge.id,
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

export const challenge9Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge9Task2',
  name: 'Sunset View Likes Increase',
  description: `a. Post on X tagging @xyro_io;\nb. Get 10 likes under the post.`,
  number: 2,
  reward: V * 3,
  configuration: {
    countLikesOnTweets: 10,
    countTweets: 1,
  } as Configuration,
  pattern: ChallengeTaskPattern.SHAROOOORS_CHALLENGE,
  challenge: {
    connect: {
      id: theSharoooorsChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge9Task1.id,
    }
  }
};

export const challenge9Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge9Task3',
  name: 'Adventure Story Likes Boost',
  description: `a. Post on X tagging @xyro_io;\nb. Get 100 likes under the post.`,
  number: 3,
  reward: V * 3,
  configuration: {
    countLikesOnTweets: 100,
    countTweets: 1,
  } as Configuration,
  pattern: ChallengeTaskPattern.SHAROOOORS_CHALLENGE,
  challenge: {
    connect: {
      id: theSharoooorsChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge9Task2.id,
    }
  }
};

export const challenge9Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge9Task4',
  name: 'Favorite Quote Likes Scaling',
  description: `a. Post on X tagging @xyro_io;\nb. Get 500 likes under the post.`,
  number: 4,
  reward: V * 3,
  configuration: {
    countLikesOnTweets: 500,
    countTweets: 1,
  } as Configuration,
  pattern: ChallengeTaskPattern.SHAROOOORS_CHALLENGE,
  challenge: {
    connect: {
      id: theSharoooorsChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge9Task3.id,
    }
  }
};

export const challenge9Task5: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge9Task5',
  name: 'Achievement Celebration Likes Progress',
  description: `a. Post on X tagging @xyro_io;\nb. 1000 likes under the post.`,
  number: 5,
  reward: V * 4,
  configuration: {
    countLikesOnTweets: 1000,
    countTweets: 1,
  } as Configuration,
  pattern: ChallengeTaskPattern.SHAROOOORS_CHALLENGE,
  challenge: {
    connect: {
      id: theSharoooorsChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge9Task4.id,
    }
  }
};
