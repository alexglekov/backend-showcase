import { Injectable } from '@nestjs/common';
import {
  SetupBetGraphQLOrphanEntity,
  SetupGameGraphQLOrphanEntity
} from '@xyro/contracts/setups';
import DataLoader from 'dataloader';
import { BetSetup, GameSetup } from '@prisma/client';

import { SetupBetsReadService } from '../bets/services/setupBetsRead.service';
import { SetupGameReadService } from '../games/services/setupGame.read-service';
import { SetupBetGraphQLEntity } from '../bets/graphql-models/setupBetGraphQLEntity';
import { SetupGameGraphQLEntity } from '../games/graphql-models/setupGameGraphQLEntity';

const RESOLVE_BET_REFERENCE_DATA_LOADER_NAME = `SetupBetGraphQLEntityResolver.resolveReference`
const RESOLVE_GAME_REFERENCE_DATA_LOADER_NAME = `SetupGameGraphQLEntityResolver.resolveReference`

@Injectable()
export class DataLoaderService {
  private readonly dataloaders: Map<string, DataLoader<any, any>> = new Map();

  constructor(
    private readonly setupBetsReadService: SetupBetsReadService,
    private readonly setupGamesReadService: SetupGameReadService,
  ) {}

  async getBetByReference(reference: SetupBetGraphQLOrphanEntity): Promise<SetupBetGraphQLEntity | null> {
    let dataLoader = this.dataloaders.get(RESOLVE_BET_REFERENCE_DATA_LOADER_NAME);

    if (!dataLoader) {
      dataLoader = new DataLoader(
        async (references: SetupBetGraphQLOrphanEntity[]) => {
          const resolvedBets = await this.setupBetsReadService.resolveReferences(references);

          const sortedInIdsOrder = references.map((ref) => {
            const resolvedBet = resolvedBets.find(
              (bet: BetSetup) => bet.gameId === ref.gameId && bet.ownerId === ref.ownerId,
            );

            return resolvedBet ? new SetupBetGraphQLEntity(resolvedBet) : null;
          });

          return sortedInIdsOrder;
        },
      );
      this.dataloaders.set(RESOLVE_BET_REFERENCE_DATA_LOADER_NAME, dataLoader);
    }

    return dataLoader.load(reference);
  }

  async getGameByReference(reference: SetupGameGraphQLOrphanEntity) {
    let dataLoader = this.dataloaders.get(RESOLVE_GAME_REFERENCE_DATA_LOADER_NAME);

    if (!dataLoader) {
      dataLoader = new DataLoader(
        async (references: SetupGameGraphQLOrphanEntity[]) => {
          const resolvedGames = await this.setupGamesReadService.resolveReferences(references);

          const sortedInIdsOrder = references.map((ref) => {
            const resolvedGame = resolvedGames.find(
              (bet: GameSetup) => bet.id === ref.id,
            );

            return resolvedGame ? new SetupGameGraphQLEntity(resolvedGame) : null;
          });

          return sortedInIdsOrder;
        },
      );
      this.dataloaders.set(RESOLVE_GAME_REFERENCE_DATA_LOADER_NAME, dataLoader);
    }

    return dataLoader.load(reference);
  }
}
