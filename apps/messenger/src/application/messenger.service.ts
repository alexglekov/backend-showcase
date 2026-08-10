import { MessageCreatedDomainEvent } from '@xyro/contracts/messenger';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Message, Room, RoomTypesEnum } from '@prisma/client';
import { LedgerService } from '@xyro/contracts/ledger';
import { AppsNames } from '@xyro/core';
import { lastValueFrom } from 'rxjs';
import BadWordsFilter from 'bad-words';
import { ConfigService } from '@nestjs/config';
import { DomainEventsPublisher } from '@xyro/libs/events';
import { Decimal } from 'decimal.js';

import { PrismaService } from '../infrastructure/prisma';
import { Config } from '../infrastructure/config';

const MIN_USER_BALANCE_TO_CREATE_MESSAGE = 0;

type CreateMessageParams = {
  text: string;
  roomId: string;
  userId: string;
  replyToId?: string;
}

type GetRoomMessagesPaginatedParams = {
  roomId: string;
  skip?: number;
  take?: number;
}

type GetUserMessagesAmountParams = {
  userId: string;
}

type CheckUserAllowSendMessageResult =
  { userIsBlocked: true; reasonForBlocking: string }
  | { userIsBlocked: false; reasonForBlocking?: string };

const REMOVED_URL_PLACEHOLDER = 'link removed';
const URL_REGEX =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
const WHITESPACE_REGEX=new RegExp(/\s+/);

@Injectable()
export class MessengerService {
  readonly badWordsFilter = new BadWordsFilter({
    placeHolder: '*',
    splitRegex: WHITESPACE_REGEX,
  });

  constructor(
    @Inject(AppsNames.Ledger) private readonly ledgerService: LedgerService,
    private readonly prismaService: PrismaService,
    private readonly domainEventsPublisher: DomainEventsPublisher,
    private readonly configService: ConfigService<Config>,
  ) {}

  async onModuleInit() {
    const globalRoom = await this.prismaService.room.findFirst({
      where: { type: RoomTypesEnum.GLOBAL },
    });

    if (!globalRoom) {
      await this.prismaService.room.create({
        data: {
          type: RoomTypesEnum.GLOBAL,
        },
      });
    }
  }

  async getUserMessagesAmount(parms: GetUserMessagesAmountParams) {
    const { userId } = parms;
    return this.prismaService.message.count({ where: { senderId: userId } });
  }

  private async userHasDeposits(userId: string): Promise<boolean> {
    const currentBalance = await lastValueFrom(
      this.ledgerService.getUserBalance({ userId })
    );
    return new Decimal(currentBalance.amount).gt(MIN_USER_BALANCE_TO_CREATE_MESSAGE);
  }

  public async createMessage(params: CreateMessageParams): Promise<Message> {
    const { userIsBlocked, reasonForBlocking } = await this.checkUserAllowSendMessage(params.userId);

    if (userIsBlocked) throw new BadRequestException(reasonForBlocking);

    const uniqueIdsArray = this.extractTaggedUsersIds(params.text);

    const preparedText = this.prepareMessageText(params.text);

    const message = await this.prismaService.$transaction(
      async (dbTransaction) => {
        const message = await dbTransaction.message.create({
          data: {
            text: preparedText,
            roomId: params.roomId,
            senderId: params.userId,
            replyToId: params.replyToId || undefined,
            tagList: uniqueIdsArray,
          },
          include: {
            replyTo: true,
          },
        });

        return message;
      },
    );

    await this.domainEventsPublisher.publish(new MessageCreatedDomainEvent(message));

    return message;
  }

  async checkUserAllowSendMessage(userId: string): Promise<CheckUserAllowSendMessageResult> {
    let reasonForBlocking: string | undefined = undefined;

    const isUserAllowedSendMessage = await this.isUserAllowedToSendMessage(userId);

    if (!isUserAllowedSendMessage) reasonForBlocking = `You have been blocked and cannot send a message.`;

    const hasDeposits = await this.userHasDeposits(userId);

    if (!hasDeposits) reasonForBlocking = `Can't send message with empty balance`;

    const userIsBlocked = !(isUserAllowedSendMessage && hasDeposits);

    return {
      userIsBlocked,
      reasonForBlocking: userIsBlocked ? reasonForBlocking : undefined,
    } as CheckUserAllowSendMessageResult
  }

  private async isUserAllowedToSendMessage(userId: string) {
    const blockedUserFeatures = await this.prismaService.blockedUserFeatures.findFirst({
      where: { userId }
    });

    if (blockedUserFeatures) return blockedUserFeatures.allowSendMessage;

    return true;
  }

  private extractTaggedUsersIds(text: string): string[] {
    const regex = /\[@([^)]+)\]\(([^)]+)\)/g;
    let match;
    const extractedIds = new Set<string>();
    while ((match = regex.exec(text)) !== null) {
      const id = match[2];
      extractedIds.add(id);
    }

    return [...extractedIds];
  }

  private prepareMessageText(text: string): string {
    const { allowedDomains } = this.configService.get('app');

    const preparedText = text.replace(WHITESPACE_REGEX, ' ').trim() + ' ';

    const filteredText = this.badWordsFilter.clean(preparedText).trim();

    const textWithoutLinks = filteredText.replace(URL_REGEX, (url) =>
      allowedDomains
        .some((allowedDomain) => url.toLowerCase().includes(allowedDomain)) ? url : REMOVED_URL_PLACEHOLDER,
    );

    return textWithoutLinks;
  }

  public async getGlobalRoom(): Promise<Room> {
    return this.prismaService.room.findFirstOrThrow({
      where: {
        type: RoomTypesEnum.GLOBAL,
      },
    });
  }

  async getRoomMessages(params: GetRoomMessagesPaginatedParams): Promise<Message[]> {
    return this.prismaService.message.findMany({
      where: { room: { id: params.roomId } },
      include: {
        replyTo: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: params.skip,
      take: params.take,
    });
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    return this.prismaService.message.findFirst({
      where: { id: messageId },
    });
  }

  async getMessageByIdOrThrow(messageId: string): Promise<Message> {
    const message = await this.getMessageById(messageId);

    if (!message) {
      throw new BadRequestException(`Message not found with id ${messageId}`);
    }

    return message;
  }
}
