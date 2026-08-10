import { Prisma, ChallengeTaskPattern } from '@prisma/client';

import { season } from '../season';
import { theChatChadsChallenge } from '../challenges';
import { challenge1Task6 } from './challenge1Tasks';
import { V } from './constants';

type Configuration = Record<string, any> & {
  messagesAmount: number;
}

export const challenge7Task1: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge7Task1',
  name: 'Chat Starter',
  description: `Post 1 message in the chat\nAttention: the chat is moderated. Spamming & offensive messages are punished with the loss of rewards.`,
  number: 1,
  reward: V,
  configuration: {
    messagesAmount: 1,
  } as Configuration,
  pattern: ChallengeTaskPattern.CREATE_CHAT_MESSAGES,
  challenge: {
    connect: {
      id: theChatChadsChallenge.id,
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

export const challenge7Task2: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge7Task2',
  name: 'Informer',
  description: `Post 10 message in the chat\nAttention: the chat is moderated. Spamming & offensive messages are punished with the loss of rewards.`,
  number: 2,
  reward: V * 2,
  configuration: {
    messagesAmount: 10,
  } as Configuration,
  pattern: ChallengeTaskPattern.CREATE_CHAT_MESSAGES,
  challenge: {
    connect: {
      id: theChatChadsChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge7Task1.id,
    }
  }
};

export const challenge7Task3: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge7Task3',
  name: 'Lot Linguist',
  description: `Post 100 message in the chat\nAttention: the chat is moderated. Spamming & offensive messages are punished with the loss of rewards.`,
  number: 3,
  reward: V * 2,
  configuration: {
    messagesAmount: 100,
  } as Configuration,
  pattern: ChallengeTaskPattern.CREATE_CHAT_MESSAGES,
  challenge: {
    connect: {
      id: theChatChadsChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge7Task2.id,
    }
  }
};

export const challenge7Task4: Prisma.ChallengeTaskCreateInput = {
  id: 'challenge7Task4',
  name: 'Lot Luminary',
  description: `Post 1000 message in the chat\nAttention: the chat is moderated. Spamming & offensive messages are punished with the loss of rewards.`,
  number: 4,
  reward: V * 3,
  configuration: {
    messagesAmount: 1000,
  } as Configuration,
  pattern: ChallengeTaskPattern.CREATE_CHAT_MESSAGES,
  challenge: {
    connect: {
      id: theChatChadsChallenge.id,
    },
  },
  season: {
    connect: {
      id: season.id,
    }
  },
  blockedByTask: {
    connect: {
      id: challenge7Task3.id,
    }
  }
};
