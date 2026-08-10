interface SetupGamesHeapItem {
  gameId: string;
  isLong: boolean;
  takeProfit: number;
  stopLoss: number;
  startAtTimestamp: number;
  endAtTimestamp: number;
}

interface SetupGamesHeapData {
  assetId: string;
  games: SetupGamesHeapItem[];
}

export class SetupGamesHeapByAsset {
  private readonly assetId: string;
  private heap: SetupGamesHeapItem[];

  constructor(data: SetupGamesHeapData) {
    const { assetId, games } = data;
    this.assetId = assetId;
    this.heap = games;
  }

  public addGame(game: SetupGamesHeapItem) {
    this.heap.push(game);
  }

  public addGames(games: SetupGamesHeapItem[]) {
    this.heap.push(...games);
  }

  public deleteOldGames() {
    const currentTime = Date.now();
    this.heap = this.heap.filter((game) => game.endAtTimestamp > currentTime);
  }

  public deleteGames(gamesIds: string[]) {
    const gamesMap = new Map<string, boolean>(gamesIds.map((gameId) => [gameId, true]));

    this.heap = this.heap.filter((game) => !gamesMap.has(game.gameId));
  }

  public getGamesByPrice(assetPrice: number, timestamp: number): SetupGamesHeapItem[] {
    return this.heap.filter((game) => {
      if (game.startAtTimestamp > timestamp || timestamp > game.endAtTimestamp) return false;

      const { isLong, takeProfit, stopLoss } = game;

      return isLong ? takeProfit < assetPrice || assetPrice < stopLoss
        : stopLoss < assetPrice || assetPrice < takeProfit;
    });
  }

  public toJSON(): SetupGamesHeapData {
    return {
      assetId: this.assetId,
      games: this.heap,
    }
  }
}
