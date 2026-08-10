import { Prisma, ChallengeTaskPattern } from '@prisma/client';

import { season } from '../season';
import { activePlayersChallenge } from '../challenges';
import { challenge1Task6 } from './challenge1Tasks';
import { V } from './constants';

export const challenge3Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task1',
  name: 'Rookie',
  description: `Play any 1 game on Xyro.`,
  number: 1,
  reward: V * 3,
  configuration: {
    amountGames: 1,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
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

export const challenge3Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task2',
  name: 'Apprentice',
  description: `Play any 5 games on Xyro.`,
  number: 2,
  reward: V * 2 * 2,
  configuration: {
    amountGames: 5,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task1.id,
    }
  }
};

export const challenge3Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task3',
  name: 'Initiate',
  description: `Play any 10 games on Xyro.`,
  number: 3,
  reward: V * 2 * 3,
  configuration: {
    amountGames: 10,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task2.id,
    }
  }
};

export const challenge3Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task4',
  name: 'Explorer',
  description: `Play any 25 games on Xyro.`,
  number: 4,
  reward: V * 2 * 4,
  configuration: {
    amountGames: 25,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task3.id,
    }
  }
};

export const challenge3Task5: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task5',
  name: 'Ninja',
  description: `Play any 50 games on Xyro.`,
  number: 5,
  reward: V * 1 * 50,
  configuration: {
    amountGames: 50,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task4.id,
    }
  }
};

export const challenge3Task6: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task6',
  name: 'Patron',
  description: `Play any 100 games on Xyro.`,
  number: 6,
  reward: V * 1 * 50,
  configuration: {
    amountGames: 100,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task5.id,
    }
  }
};

export const challenge3Task7: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task7',
  name: 'Master',
  description: `Play any 150 games on Xyro.`,
  number: 7,
  reward: V * 1 * 50,
  configuration: {
    amountGames: 150,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task6.id,
    }
  }
};

export const challenge3Task8: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task8',
  name: 'Champion',
  description: `Play any 250 games on Xyro.`,
  number: 8,
  reward: V * 0.5 * 100,
  configuration: {
    amountGames: 250,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task7.id,
    }
  }
};

export const challenge3Task9: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task9',
  name: 'Conqueror',
  description: `Play any 500 games on Xyro.`,
  number: 9,
  reward: V * 0.5 * 250,
  configuration: {
    amountGames: 500,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task8.id,
    }
  }
};

export const challenge3Task10: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task10',
  name: 'Ace',
  description: `Play any 750 games on Xyro.`,
  number: 10,
  reward: V * 0.5 * 250,
  configuration: {
    amountGames: 750,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task9.id,
    }
  }
};

export const challenge3Task11: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task11',
  name: 'Wizard',
  description: `Play any 1000 games on Xyro.`,
  number: 11,
  reward: V * 0.5 * 250,
  configuration: {
    amountGames: 1000,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task10.id,
    }
  }
};

export const challenge3Task12: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge3Task12',
  name: 'Grandmaster',
  description: `Play any 5000 games on Xyro.`,
  number: 12,
  reward: V * 0.5 * 1000,
  configuration: {
    amountGames: 5000,
  },
  pattern: ChallengeTaskPattern.PLAY_ANY_GAME,
  challenge: {
    connect: {
      id: activePlayersChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge3Task11.id,
    }
  }
};
