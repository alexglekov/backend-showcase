import { TelegramConfig } from './telegram-config.type';

export const loadTelegramConfig = (): TelegramConfig => {
  return {
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN!,
      chatId: Number(process.env.TELEGRAM_ALERTING_CHAT_ID)!,
    },
  };
};
