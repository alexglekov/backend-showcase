import { Prisma, ChallengeTaskPattern } from '@prisma/client';

import { season } from '../season';
import { theWhaleSquadChallenge } from '../challenges';
import { challenge1Task6 } from './challenge1Tasks';
import { V } from './constants';

type Configuration = Record<string, any> & {
  totalBetsAmount: number;
  wonAmount: number;
}

export const challenge5Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task1',
  name: 'Sardine',
  description: `Reach 10 XYRO in cumulative bidding volume`,
  number: 1,
  reward: V * 0.5,
  configuration: {
    totalBetsAmount: 10,
    wonAmount: 0,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
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

export const challenge5Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task2',
  name: 'Baby Whale',
  description: `Reach 100 XYRO in cumulative bidding volume;\nWin at least 15 XYRO.`,
  number: 2,
  reward: V * 1,
  configuration: {
    totalBetsAmount: 100,
    wonAmount: 15,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task1.id,
    }
  }
};

export const challenge5Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task3',
  name: 'Pygmy Whale',
  description: `Reach 250 XYRO in cumulative bidding volume;\nWin at least 25 XYRO.`,
  number: 3,
  reward: V * 2.5,
  configuration: {
    totalBetsAmount: 250,
    wonAmount: 25,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task2.id,
    }
  }
};

export const challenge5Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task4',
  name: 'Beluga Whale',
  description: `Reach 500 XYRO in cumulative bidding volume;\nWin at least 50 XYRO.`,
  number: 4,
  reward: V * 2.5,
  configuration: {
    totalBetsAmount: 500,
    wonAmount: 50,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task3.id,
    }
  }
};

export const challenge5Task5: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task5',
  name: 'Pilot Whale',
  description: `Reach 1000 XYRO in cumulative bidding volume;\nWin at least 100 XYRO.`,
  number: 5,
  reward: V * 5,
  configuration: {
    totalBetsAmount: 1000,
    wonAmount: 100,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task4.id,
    }
  }
};

export const challenge5Task6: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task6',
  name: 'Whale Shark',
  description: `Reach 5000 XYRO in cumulative bidding volume;\nWin at least 250 XYRO.`,
  number: 6,
  reward: V * 40,
  configuration: {
    totalBetsAmount: 5000,
    wonAmount: 250,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task5.id,
    }
  }
};

export const challenge5Task7: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task7',
  name: 'Fin Whale',
  description: `Reach 10000 XYRO in cumulative bidding volume;\nWin at least 1000 XYRO.`,
  number: 7,
  reward: V * 50,
  configuration: {
    totalBetsAmount: 10000,
    wonAmount: 1000,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task6.id,
    }
  }
};

export const challenge5Task8: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task8',
  name: 'Blue Whale',
  description: `Reach 25000 XYRO in cumulative bidding volume;\nWin at least 5000 XYRO.`,
  number: 8,
  reward: V * 150,
  configuration: {
    totalBetsAmount: 25000,
    wonAmount: 5000,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task7.id,
    }
  }
};

export const challenge5Task9: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge5Task9',
  name: 'Legendary Whale',
  description: `Reach 50000 XYRO in cumulative bidding volume;\nWin at least 10000 XYRO.`,
  number: 9,
  reward: V * 250,
  configuration: {
    totalBetsAmount: 50000,
    wonAmount: 10000,
  } as Configuration,
  pattern: ChallengeTaskPattern.WHALE_SQUAD,
  challenge: {
    connect: {
      id: theWhaleSquadChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge5Task8.id,
    }
  }
};
