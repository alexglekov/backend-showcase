import { Prisma } from '@prisma/client';

import { season } from './season';

export const theWayOfXYROChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge1',
  name: 'The way of XYRO',
  description: 'Tell the community about yourself',
  number: 1,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const friendNetChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge2',
  name: 'FriendNet',
  description: 'Activate users with your unique invite code',
  number: 2,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const activePlayersChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge3',
  name: 'Active Players',
  description: 'Play often and watch your rank grow',
  number: 3,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const theWinningCrewChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge4',
  name: 'The Winning Crew',
  description: 'Only winners in the building',
  number: 4,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const theWhaleSquadChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge5',
  name: 'The Whale Squad',
  description: 'Go big or go home',
  number: 5,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const influenserWayChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge6',
  name: 'Influencer way',
  description: 'Invite people to your setups',
  number: 6,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const theChatChadsChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge7',
  name: 'The Chat Chads',
  description: 'Use the chat in the Xyro app',
  number: 7,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const theSocialTribeChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge8',
  name: 'The Social Tribe',
  description: 'Stay active on Xyro',
  number: 8,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const theSharoooorsChallenge: Prisma.SeasonChallengeCreateInput = {
  id: 'challenge9',
  name: 'The Sharoooors',
  description: 'Tell your followers about Xyro',
  number: 9,
  season: {
    connect: {
      id: season.id,
    }
  },
}

export const challenges = [
  theWayOfXYROChallenge,
  friendNetChallenge,
  activePlayersChallenge,
  theWinningCrewChallenge,
  theWhaleSquadChallenge,
  influenserWayChallenge,
  theChatChadsChallenge,
  theSocialTribeChallenge,
  theSharoooorsChallenge,
];
