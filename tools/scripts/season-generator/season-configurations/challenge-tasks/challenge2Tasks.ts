import { Prisma, ChallengeTaskPattern } from '@prisma/client';

import { season } from '../season';
import { friendNetChallenge } from '../challenges';
import { challenge1Task6 } from './challenge1Tasks';
import { V } from './constants';

export const challenge2Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task1',
  name: 'Network Novice',
  description: `Activate 1 user with your unique invite code.`,
  number: 1,
  reward: V * 3,
  configuration: {
    amountInvited: 1,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
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

export const challenge2Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task2',
  name: 'Connection Curator',
  description: `Activate 2 users with your unique invite code.`,
  number: 2,
  reward: V * 2 * 2,
  configuration: {
    amountInvited: 2,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task1.id,
    }
  }
};

export const challenge2Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task3',
  name: 'Link Leader',
  description: `Activate 5 users with your unique invite code.`,
  number: 3,
  reward: V * 2 * 3,
  configuration: {
    amountInvited: 5,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task2.id,
    }
  }
};

export const challenge2Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task4',
  name: 'Network Navigator',
  description: `Activate 10 users with your unique invite code.`,
  number: 4,
  reward: V * 2 * 6,
  configuration: {
    amountInvited: 10,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task3.id,
    }
  }
};

export const challenge2Task5: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task5',
  name: 'Connection Captain',
  description: `Activate 20 users with your unique invite code.`,
  number: 5,
  reward: V * 2 * 9,
  configuration: {
    amountInvited: 20,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task4.id,
    }
  }
};

export const challenge2Task6: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task6',
  name: 'Referral Regent',
  description: `Activate 50 users with your unique invite code.`,
  number: 6,
  reward: V * 2 * 20,
  configuration: {
    amountInvited: 50,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task5.id,
    }
  }
};

export const challenge2Task7: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task7',
  name: 'Community Champion 1',
  description: `Activate 100 users with your unique invite code.`,
  number: 7,
  reward: V * 1 * 50,
  configuration: {
    amountInvited: 100,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task6.id,
    }
  }
};

export const challenge2Task8: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task8',
  name: 'Community Champion 2',
  description: `Activate 250 users with your unique invite code.`,
  number: 8,
  reward: V * 1 * 50,
  configuration: {
    amountInvited: 250,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task7.id,
    }
  }
};

export const challenge2Task9: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task9',
  name: 'Community Champion 3',
  description: `Activate 500 users with your unique invite code.`,
  number: 9,
  reward: V * 0.5 * 100,
  configuration: {
    amountInvited: 500,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task8.id,
    }
  }
};

export const challenge2Task10: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge2Task10',
  name: 'Community Champion 4',
  description: `Activate 1000 users with your unique invite code.`,
  number: 10,
  reward: V * 0.5 * 250,
  configuration: {
    amountInvited: 1000,
  },
  pattern: ChallengeTaskPattern.INVITE_USERS,
  challenge: {
    connect: {
      id: friendNetChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge2Task9.id,
    }
  }
};
