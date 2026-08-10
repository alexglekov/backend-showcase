import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { AppsNames } from '@xyro/core';

import { AlertManager, NotifyParams } from './alertManager.service-port';
import { Config } from '../config';

@Injectable()
export class TelegramAlertManagerAdapter extends AlertManager {
  private client: TelegramBot;

  constructor(
    private readonly configService: ConfigService<Config>,
  ) {
    super();

    const { botToken } = this.configService.get('telegram');

    this.client = new TelegramBot(botToken);
  }

  async notify(params: NotifyParams): Promise<void> {
    const { description, level, title } = params;
    const { env } = this.configService.get('app');
    const { chatId } = this.configService.get('telegram');

    await this.client.sendMessage(
      chatId,
      `${title}\n\n<b>Description</b>:\n ${description}\n<b>Level</b>: ${level}\n<b>Env</b>: ${env}\n<b>App</b>: ${AppsNames.BullsEyeWorker}`,
      {
        parse_mode : "HTML",
      }
    );
  }
}