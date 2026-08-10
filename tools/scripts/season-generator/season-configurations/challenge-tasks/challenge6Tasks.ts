import { Prisma, ChallengeTaskPattern } from '@prisma/client';

import { season } from '../season';
import { influenserWayChallenge } from '../challenges';
import { challenge1Task6 } from './challenge1Tasks';
import { V } from './constants';

type Configuration = Record<string, any> & {
  likeInfluenser: boolean;
  finishGamesAmount?: number;
  setupPoolSize?: number;
}

export const challenge6Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task1',
  name: 'One',
  description: `Create and finish 1 setup.`,
  number: 1,
  reward: V,
  configuration: {
    likeInfluenser: true,
    finishGamesAmount: 1,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
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

export const challenge6Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task2',
  name: 'Advocate',
  description: `Create and finish 2 setup.`,
  number: 2,
  reward: V * 1.5,
  configuration: {
    likeInfluenser: true,
    finishGamesAmount: 2,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge6Task1.id,
    }
  }
};

export const challenge6Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task3',
  name: 'Promoter',
  description: `In your finished setups 20 users.`,
  number: 3,
  reward: V * 2,
  configuration: {
    likeInfluenser: true,
    setupPoolSize: 20,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge6Task2.id,
    }
  }
};

export const challenge6Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task4',
  name: 'Ally',
  description: `In your finished setups 50 users.`,
  number: 4,
  reward: V * 2.5,
  configuration: {
    likeInfluenser: true,
    setupPoolSize: 50,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge6Task3.id,
    }
  }
};

export const challenge6Task5: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task5',
  name: 'Zealot',
  description: `In your finished setups 100 users.`,
  number: 5,
  reward: V * 3.5,
  configuration: {
    likeInfluenser: true,
    setupPoolSize: 100,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge6Task4.id,
    }
  }
};

export const challenge6Task6: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task6',
  name: 'Zealot 2',
  description: `In your finished setups 250 users.`,
  number: 6,
  reward: V * 4,
  configuration: {
    likeInfluenser: true,
    setupPoolSize: 250,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge6Task5.id,
    }
  }
};

export const challenge6Task7: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task7',
  name: 'Zealot 3',
  description: `In your finished setups 500 users.`,
  number: 7,
  reward: V * 4.5,
  configuration: {
    likeInfluenser: true,
    setupPoolSize: 500,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge6Task6.id,
    }
  }
};

export const challenge6Task8: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge6Task8',
  name: 'Zealot X',
  description: `In your finished setups 1000 users.`,
  number: 8,
  reward: V * 5,
  configuration: {
    likeInfluenser: true,
    setupPoolSize: 1000,
  } as Configuration,
  pattern: ChallengeTaskPattern.PLAY_SETUP_GAMES,
  challenge: {
    connect: {
      id: influenserWayChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge6Task7.id,
    }
  }
};