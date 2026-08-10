import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

type TEventPayload = {
  tokenId: number;
  amount: number;
  walletAddress: string;
}

export class WalletAddressReceivedNftDomainEventPayload implements BaseEventPayload {
  @IsNumber()
  @IsNotEmpty()
  public readonly tokenId!: number;

  @IsNumber()
  @IsNotEmpty()
  public readonly amount!: number;

  @IsString()
  @IsNotEmpty()
  public readonly walletAddress!: string;

  constructor(payload?: TEventPayload) {
    if (!payload) return;

    this.tokenId = payload.tokenId;
    this.amount = payload.amount;
    this.walletAddress = payload.walletAddress;
  }

  toJSON() {
    return Object.assign({}, this);
  };
}

export class WalletAddressReceivedNftDomainEvent extends BaseEvent<WalletAddressReceivedNftDomainEventPayload> {
  override eventClass = WalletAddressReceivedNftDomainEvent;

  public static override topic: string = 'wallet-address-received-nft';
  public override payload: WalletAddressReceivedNftDomainEventPayload;

  constructor(payload: TEventPayload) {
    super();

    this.payload = new WalletAddressReceivedNftDomainEventPayload(payload);
  }
}
