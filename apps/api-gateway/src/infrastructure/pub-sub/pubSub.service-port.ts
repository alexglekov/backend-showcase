import { SetupGameEntity } from '@xyro/contracts/setups';
import { BullsEyeGameEntity } from '@xyro/contracts/bulls-eye';
import { X1000GameEntity } from '@xyro/contracts/x1000';
import { UpDownGameEntity } from '@xyro/contracts/up-down';
import { OneVsOneGameEntity } from '@xyro/contracts/one-vs-one';
import { BalanceEntity } from '@xyro/contracts/ledger';
import { PaymentOrderEntity } from '@xyro/contracts/users';
import { AssetPriceEntity } from '@xyro/contracts/prices';
import { NotificationEntity } from '@xyro/contracts/notifications';
import { MessageEntity } from '@xyro/contracts/messenger';
import { BetEntity, RewardEntity, SeasonEntity } from '@xyro/contracts/analytics';

export interface UpDownGameStatePayload {
  upDownGameState: UpDownGameEntity;
}

export interface UserSeasonStatePayload {
  userSeasonState: SeasonEntity;
}

export interface X1000GameStatePayload {
  x1000GameState: X1000GameEntity;
}

export interface PublicX1000GamesPayload {
  publicX1000Games: X1000GameEntity;
}

export interface BullsEyeGameStatePayload {
  bullsEyeGameState: BullsEyeGameEntity;
}

export interface OneVsOneGameStatePayload {
  oneVsOneGameState: OneVsOneGameEntity;
}

export interface CreatedOneVsOneGamePayload {
  createdOneVsOneGame: OneVsOneGameEntity;
}

export interface MessageStatePayload {
  roomMessages: MessageEntity;
}

export interface BalanceUpdatedStatePayload {
  updatedBalance: BalanceEntity;
}

export interface RewardUpdatedStatePayload {
  updatedReward: RewardEntity;
}

export interface PaymentOrderStatePayload {
  paymentOrdersState: PaymentOrderEntity;
}


export interface AssetPriceChangedPayload {
  assetPriceChanged: AssetPriceEntity;
}

export interface NotificationsPayload {
  notifications: NotificationEntity;
}

export interface SetupGameStatePayload {
  setupGameState: SetupGameEntity;
}

export interface CreatedSetupGamePayload {
  createdSetupGame: SetupGameEntity;
}

export interface LuckyBetStreamPayload {
  luckyBetsStream: BetEntity;
}

export interface HighWagerBetStreamPayload {
  highWagerBetsStream: BetEntity;
}

export interface HighestPnlBetStreamPayload {
  highestPnlBetsStream: BetEntity;
}

export interface OnlineCountPayload {
  online: number;
}

export abstract class PubSubService {
  abstract publishUpDownGameState(payload: UpDownGameStatePayload): Promise<void>;
  abstract upDownGameState(): AsyncIterator<UpDownGameStatePayload>;

  abstract publishX1000GameState(userId: string, payload: X1000GameStatePayload): Promise<void>;
  abstract x1000GameState(userId: string): AsyncIterator<X1000GameStatePayload>;

  abstract publishPublicX1000Game(payload: PublicX1000GamesPayload): Promise<void>;
  abstract publicX1000Games(): AsyncIterator<PublicX1000GamesPayload>;

  abstract publishNotification(userId: string, payload: NotificationsPayload): Promise<void>;
  abstract notifications(userId: string): AsyncIterator<NotificationsPayload>;
  
  abstract publishPaymentOrderState(userId: string, payload: PaymentOrderStatePayload): Promise<void>;
  abstract paymentOrdersState(userId: string): AsyncIterator<PaymentOrderStatePayload>;

  abstract publishBullsEyeGameState(payload: BullsEyeGameStatePayload): Promise<void>;
  abstract bullsEyeGameState(): AsyncIterator<BullsEyeGameStatePayload>;

  abstract publishOneVsOneGameState(gameId: string, payload: OneVsOneGameStatePayload): Promise<void>;
  abstract oneVsOneGameState(gameId: string): AsyncIterator<OneVsOneGameStatePayload>;

  abstract publishNewOneVsOneGame(payload: CreatedOneVsOneGamePayload): Promise<void>;
  abstract createdOneVsOneGame(): AsyncIterator<CreatedOneVsOneGamePayload>;

  abstract publishSetupGameState(gameId: string, payload: SetupGameStatePayload): Promise<void>;
  abstract setupGameState(gameId: string): AsyncIterator<SetupGameStatePayload>;

  abstract publishNewSetupGame(payload: CreatedSetupGamePayload): Promise<void>;
  abstract createdSetupGame(): AsyncIterator<CreatedSetupGamePayload>;

  abstract publishNewMessageToRoom(roomId: string, payload: MessageStatePayload): Promise<void>;
  abstract roomMessages(roomId: string): AsyncIterator<MessageStatePayload>;

  abstract publishUpdatedBalance(accountId: string, payload: BalanceUpdatedStatePayload): Promise<void>;
  abstract updatedBalance(accountId: string): AsyncIterator<BalanceUpdatedStatePayload>;

  abstract publishAssetPriceChanged(assetId: string, payload: AssetPriceChangedPayload): Promise<void>;
  abstract assetPriceChanged(assetId: string): AsyncIterator<AssetPriceChangedPayload>;

  abstract publishLuckyBet(payload: LuckyBetStreamPayload): Promise<void>;
  abstract luckyBets(): AsyncIterator<LuckyBetStreamPayload>;

  abstract publishUserSeasonState(userId: string, payload: UserSeasonStatePayload): Promise<void>;
  abstract userSeasonState(userId: string): AsyncIterator<UserSeasonStatePayload>;

  abstract publishHighWagerBet(payload: HighWagerBetStreamPayload): Promise<void>;
  abstract highWagerBets(): AsyncIterator<HighWagerBetStreamPayload>;

  abstract publishHighestPnlBet(payload: HighestPnlBetStreamPayload): Promise<void>;
  abstract highestPnlBet(): AsyncIterator<HighestPnlBetStreamPayload>;

  abstract publishUpdatedReward(userId: string, payload: RewardUpdatedStatePayload): Promise<void>;
  abstract updatedReward(userId: string): AsyncIterator<RewardUpdatedStatePayload>;
}

export abstract class GlobalPubSubService {
  abstract publishOnlineCount(payload: OnlineCountPayload): Promise<void>;
  abstract online(): AsyncIterator<OnlineCountPayload>;
};
