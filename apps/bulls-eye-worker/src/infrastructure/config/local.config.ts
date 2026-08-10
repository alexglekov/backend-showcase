export const gameConfig = {
  openTimeframeSeconds: 30,
  inProgressTimeframeSeconds: 90,
  startDelay: 10000,
  asset: 'BTC',
  betAmount: 50,
  accuracyLevel: 0.01,
  exactWinnerCoefficients: {
    firstPlace: 0.75,
    secondPlace: 0.15,
    thirdPlace: 0.10,
    twoParticipantsCase: {
      firstPlace: 0.80,
      secondPlace: 0.20,
    },
  },
  defaultWinnerCoefficients: {
    firstPlace: 0.50,
    secondPlace: 0.35,
    thirdPlace: 0.15,
    twoParticipantsCase: {
      firstPlace: 0.75,
      secondPlace: 0.25,
    },
  },
};
