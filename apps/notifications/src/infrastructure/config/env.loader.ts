import { loadAppConfig } from './modules/app';
import { loadKafkaConfig } from './modules/kafka';
import { loadMailerConfig } from './modules/mailer';

export const configLoader = [loadAppConfig, loadKafkaConfig, loadMailerConfig];
