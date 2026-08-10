import { BaseEvent, BaseEventPayload } from '@xyro/libs/events';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

type TEventPayload = {
  tokenId: number;
  amount: number;
  walletAddress: string;
}

export class WalletAddressGaveNftDomainEventPayload implements BaseEventPayload {
  @IsNumber()
  @IsNotEmpty()
  public readonly tokenId!: number;

  @IsNumber()
  @IsNotEmpty()
  public readonly amount!: number;
  
  @IsString()
  @IsNotEmpty()
  public readonly walletAddress!: string;

  constructor(payload: TEventPayload) {
    if (!payload) return;

    this.tokenId = payload.tokenId;
    this.amount = payload.amount;
    this.walletAddress = payload.walletAddress;
  }

  toJSON() {
    return Object.assign({}, this);
  };
}

export class WalletAddressGaveNftDomainEvent extends BaseEvent<WalletAddressGaveNftDomainEventPayload> {
  override eventClass = WalletAddressGaveNftDomainEvent;

  public static override topic: string = 'wallet-address-gave-nft';
  public override payload: WalletAddressGaveNftDomainEventPayload;

  constructor(payload: TEventPayload) {
    super();

    this.payload = new WalletAddressGaveNftDomainEventPayload(payload);
  }
}
