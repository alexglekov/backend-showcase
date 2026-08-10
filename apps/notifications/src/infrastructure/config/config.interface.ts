import { AppConfig } from './modules/app';
import { KafkaConfig } from './modules/kafka';
import { MailerConfig } from './modules/mailer';

export interface Config extends AppConfig, KafkaConfig, MailerConfig {}
