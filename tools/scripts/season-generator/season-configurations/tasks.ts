import { Prisma } from '@prisma/client';

import { challenge1Task1, challenge1Task2, challenge1Task3, challenge1Task4, challenge1Task5, challenge1Task6 } from './challenge-tasks/challenge1Tasks';
import { challenge2Task1, challenge2Task2, challenge2Task3, challenge2Task4, challenge2Task5, challenge2Task6, challenge2Task7, challenge2Task8, challenge2Task9, challenge2Task10 } from './challenge-tasks/challenge2Tasks';
import { challenge3Task1, challenge3Task2, challenge3Task3, challenge3Task4, challenge3Task5, challenge3Task6, challenge3Task7, challenge3Task8, challenge3Task9, challenge3Task10, challenge3Task11, challenge3Task12 } from './challenge-tasks/challenge3Tasks';
import { challenge4Task1, challenge4Task2, challenge4Task3, challenge4Task4, challenge4Task5 } from './challenge-tasks/challenge4Tasks';
import { challenge5Task1, challenge5Task2, challenge5Task3, challenge5Task4, challenge5Task5, challenge5Task6, challenge5Task7, challenge5Task8, challenge5Task9 } from './challenge-tasks/challenge5Tasks';
import { challenge6Task1, challenge6Task2, challenge6Task3, challenge6Task4, challenge6Task5, challenge6Task6, challenge6Task7, challenge6Task8 } from './challenge-tasks/challenge6Tasks';
import { challenge7Task1, challenge7Task2, challenge7Task3, challenge7Task4 } from './challenge-tasks/challenge7Tasks';
import { challenge8Task1, challenge8Task2, challenge8Task3, challenge8Task4 } from './challenge-tasks/challenge8Tasks';
import { challenge9Task1, challenge9Task2, challenge9Task3, challenge9Task4, challenge9Task5 } from './challenge-tasks/challenge9Tasks';

export const tasks: Prisma.ChallengeTaskCreateInput[] = [
  // The Way Of XYRO Challenge
  challenge1Task1, challenge1Task2, challenge1Task3, challenge1Task4, challenge1Task5,
  challenge1Task6,

   // Friend Net Challenge
  challenge2Task1, challenge2Task2, challenge2Task3, challenge2Task4, challenge2Task5,
  challenge2Task6, challenge2Task7, challenge2Task8, challenge2Task9, challenge2Task10,

  // Active Players Challenge
  challenge3Task1, challenge3Task2, challenge3Task3, challenge3Task4, challenge3Task5,
  challenge3Task6, challenge3Task7, challenge3Task8, challenge3Task9, challenge3Task10,
  challenge3Task11, challenge3Task12,

  // The Winning Crew Challenge
  challenge4Task1, challenge4Task2, challenge4Task3, challenge4Task4, challenge4Task5,

  // The Whale Squad Challenge
  challenge5Task1, challenge5Task2, challenge5Task3, challenge5Task4, challenge5Task5,
  challenge5Task6, challenge5Task7, challenge5Task8, challenge5Task9,

  // Influenser Way Challenge
  challenge6Task1, challenge6Task2, challenge6Task3, challenge6Task4, challenge6Task5,
  challenge6Task6, challenge6Task7, challenge6Task8,

  // The Chat Chads Challenge
  challenge7Task1, challenge7Task2, challenge7Task3, challenge7Task4,

  // The Social Tribe Challenge
  challenge8Task1, challenge8Task2, challenge8Task3, challenge8Task4,

  // The Sharoooors Challenges
  challenge9Task1, challenge9Task2, challenge9Task3, challenge9Task4, challenge9Task5,
];
